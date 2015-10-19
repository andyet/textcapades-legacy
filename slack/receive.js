var S = require('string');
var models = require('../server/models');
var logger = require('debug')('textcapade');

//Nicks are different between &you and &yet
var nickMap = {
    l: 'lachesis',
    c: 'clotho',
    a: 'atropos',
    lachesis: 'lachesis',
    clotho: 'clotho',
    atropos: 'atropos'
};

module.exports.receive = function (payload) {

    var message = payload.msg;
    var from = payload.from;
    var to = nickMap[payload.to];

    return models.User.getByAttrs({ phone: 'slack', slack_username: from }).then(function (user) {

        if (!user) {
            logger('Unknown user for slack username: %s', from);
            return;
        }

        if (!user.get('ready_to_receive')) {
            logger('User %s (%s) is not ready to receive input', user.get('id'), user.get('slack_username'));
            return;
        }

        return user.parseResponse(payload.msg, 'slack');
    });
};
