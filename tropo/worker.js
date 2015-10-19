// (number)
//
var models = require('../server/models');
var Promise = require('bluebird');
var tropoApi = require('./api');
var logger = require('debug')('textcapade');

//look for messages once per second
exports.INTERVAL = 1000;

var sendNextMessage = function (phoneNumber, id) {

    models.Histories.query(function (qb) {

        qb.where({
            message_type: 'send',
            sent: false,
            from_phone: phoneNumber
        })
        .whereNotNull('from_phone')
        .andWhere('time', '<=', Math.floor(Date.now() / 1000))
        .orderByRaw('time ASC, seq ASC, id ASC');
    }).fetchOne({ require: true }).then(function (history) {

        return models.User.getByAttrs({ id: history.get('user_id') }).then(function (user) {

            return tropoApi.sendMessage({
                to: user.get('phone'),
                from: '+' + history.get('from_phone'),
                message: history.get('message')
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
            //logger('Nothing to send for %s', phoneNumber);
        } else {
            throw e;
        }
    }).catch(function (e) {

        logger('Error sending tropo messages for %s: %j', phoneNumber, e);
    }).then(function () {

        models.NumberPool.forge({ id: id }).fetch().then(function (pool) {

            if (pool) {
                setTimeout(function () {

                    sendNextMessage(phoneNumber, id);
                }, exports.INTERVAL);
            }
            else {
                logger('Stopped worker for %s due to its removal', phoneNumber);
            }
        });
    });
};

models.NumberPools.forge().fetch().then(function (pools) {

    return pools.mapThen(function (pool) {

        return exports.addWorker(pool);
    });
});

exports.addWorker = function (pool) {

    logger('Starting tropo worker sending from lachesis as %s', pool.get('lachesis'));
    setTimeout(function () {

        sendNextMessage(pool.get('lachesis'), pool.get('id'));
    }, Math.random() * exports.INTERVAL);

    logger('Starting tropo worker sending from atropos as %s', pool.get('atropos'));
    setTimeout(function () {

        sendNextMessage(pool.get('atropos'), pool.get('id'));
    }, Math.random() * exports.INTERVAL);

    logger('Starting tropo worker sending from clotho as %s', pool.get('clotho'));
    setTimeout(function () {

        sendNextMessage(pool.get('clotho'), pool.get('id'));
    }, Math.random() * exports.INTERVAL);
};
