var models = require('../server/models');
var Promise = require('bluebird');
var axios = require('axios');
var logger = require('debug')('textcapade');
var config = require('getconfig');

//look for messages ten times a second
exports.INTERVAL = 100;

var sendNextMessage = function (character) {

    models.Histories.query(function (qb) {

        qb.where({
            message_type: 'send',
            sent: false,
            from_phone: 'slack'
        })
        .whereNotNull('from_phone')
        .andWhere('time', '<=', Math.floor(Date.now() / 1000))
        .orderByRaw('time ASC, seq ASC, id ASC');
    }).fetchOne({ require: true }).then(function (history) {

        return history.related('user').fetch().then(function (user) {

            var payload = {
                to: user.get('slack_username'),
                from: history.get('from_character'),
                message: history.get('message')
            };
            logger('slack request %s %j', config.slack.apiUrl, payload);

            var opts = { headers: {} };
            //opts.headers.authorization = 'Basic ' + new Buffer(config.slack.username + ':' + config.slack.password).toString('base64');

            return axios.post(config.slack.apiUrl, payload, opts).then(function (response) {

                if (response.status >= 400) {
                    throw new Error('BadRequest: ' + response.status + ' ' + response.data);
                }
                logger('slack response %j', response);
                return response;
            }).then(function () {

                return history.save({
                    sent: true
                });
            }).then(function () {

                return user.attemptAdvance();
            });
        });
    }).catch(function (e) {

        if (e.message === 'EmptyResponse') {
            //logger('Nothing to send for slack');
        } else {
            throw e;
        }
    }).catch(function (e) {

        logger('Error sending messages for slack: %j', e);
    }).then(function () {

        setTimeout(sendNextMessage, exports.INTERVAL);

    });
};

logger('Starting slack worker');
sendNextMessage();
