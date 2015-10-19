var _ = require('lodash');

var models = require('../models.js');

module.exports = {
    main: function (request, reply) {

        models.Episodes.forge().fetch().then(function (episodeCollection) {

            var episodes = episodeCollection.toJSON();
            episodes = _.sortByOrder(episodes, 'title');
            var context = { episodes: episodes };
            reply.view('episodes', context);
        });
    },
    edit: function (request, reply) {

        var episodeId = request.params.episodeId;
        models.Episode.where({ id: episodeId }).fetch().then(function (episodeModel) {

            var context = { episode: episodeModel.toJSON() };
            reply.view('episodeEdit', context);
        });
    },
    update: function (request, reply) {

        var form = request.payload;
        // remove empty elements from the form
        form = _.omit(form, function (el) {

            if (!el) { return true; }
        });
        return models.Episode.where({ id: request.params.episodeId }).fetch().then(function (episode) {

            return episode.set(form).save().then(function () {

                reply().code(201).redirect('/moderator/episodes');
            });
        });
    }
};
