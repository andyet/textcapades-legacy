var Hoek = require('hoek');
var moment = require('moment');

var models = require('../models');

module.exports = {
    //main page for conference mod
    main: function (request, reply) {

        return models.ConferenceMessages
        .query(function () {

            this.orderBy('time', 'asc');
        })
        .fetch()
        .then(function (conferenceMessages) {

            return reply.view('conference', { conferenceMessages: conferenceMessages.toJSON() });
        });

    },
    //send one message to all attendees
    sendMessage: function (request, reply) {

        var messageAttrs = Hoek.applyToDefaults({ time: moment() }, request.payload);
        return models.ConferenceMessage
        .forge(messageAttrs)
        .save()
        .then(function (conferenceMessage) {

            var query = { where: { ticketed: true } };
            if (conferenceMessage.get('from_character') !== 'lachesis') {
                query.where.alignment = conferenceMessage.get('from_character');
            }
            return models.Users.query(query)
            .fetch({ withRelated: ['episode', 'episode.series', 'nextSeries', 'nextSeries.messages', 'lastSeries', 'lastSeries.messages', 'cohort', 'numberPool'] })
            .then(function (ticketedUsers) {

                return ticketedUsers.forEach(function (ticketedUser) {

                    return ticketedUser.sendMessage(conferenceMessage);
                });
            })
            .then(function () {

                return reply().redirect('/moderator/conference');
            });
        });
    }
};

