var S = require('string');
var models = require('../server/models');
var logger = require('debug')('textcapade');

module.exports.receive = function (payload) {

    var message = payload.msg;
    var from = payload.from;
    var to = payload.to;

    if (from.slice(0, 1) !== '+') {
        from = '+' + from;
    }

    return models.User.getByAttrs({ phone: from }).then(function (user) {

        if (!user) {
            logger('Unknown user for phone: %s', from);
            return;
        }

        if (!user.get('ready_to_receive')) {
            logger('User %s (%s) is not ready to receive input', user.get('id'), user.get('phone'));
            return;
        }

        return user.parseResponse(payload.msg, payload.from);
    });
};
