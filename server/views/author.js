var models = require('../models.js');
var _ = require('lodash');
var S = require('string');
var Promise = require('bluebird');

/*
  gets the story so far based on given answers
*/
var getStory = module.exports.getStory = function getStory (episodeTitle, seriesName, answers, user, oldStory) {

    if (seriesName.nextSeries) {
        seriesName = seriesName.nextSeries;
    };
    oldStory = oldStory || [];
    answers = answers || [];
    return models.Episode.forge({ title: episodeTitle }).fetch().then(function (episode) {

        return episode.getMessagesAndOptions({ name: seriesName }, user).then(function (data) {

            var story = data.messages.pluck('content');
            var options = data.options;
            var nextAnswer = answers.shift();
            if (nextAnswer === undefined || nextAnswer === '') {
                return { oldStory: oldStory, newStory: story, seriesName: seriesName, options: options };
            }
            var decisions = require('../../decisions/' + episodeTitle);
            if (options.indexOf(nextAnswer) === -1) {
                throw new Error('path is invalid at episode ' + episodeTitle);
            }
            if (nextAnswer !== 'continue') {
                story.push('***** User responded: ' + nextAnswer + ' ******');
            }
            var userBlob = user.toJSON();
            userBlob.first_name = user.first_name;
            userBlob.last_name = user.last_name;
            var nextSeries = decisions[seriesName](nextAnswer, userBlob);
            return getStory(episodeTitle, nextSeries, answers, user, oldStory.concat(story));
        });
    });
};

module.exports = {
    // main page for author, can select an episode
    main: function (request, reply) {

        return Promise.all([
            models.Episodes.forge().fetch(),
            models.Users.forge().fetch()
        ]).then(function (collections) {

            var episodes = _.sortByOrder(collections[0].toJSON(), 'title');
            var users = _.filter(collections[1].toJSON(), function (user) {

                return _.has(user, 'decision_blob.validOptions');
            });
            var context = {
                episodes: episodes,
                users: users
            };
            reply.view('author', context);
        });
    },
    // gets episode messages so far based on answers in url path
    // this displays a simulation of the episode for testing
    // path: '/moderator/author/{userId}/episode/{episodeTitle}/{seriesName}/{answers*}',
    getEpisode: function (request, reply) {

        if (request.payload && request.payload.option) {
            return reply().code(201).redirect(request.path + '/' + request.payload.option);
        }
        var answers = request.params.answers || '';
        answers = answers.split('/');
        return models.User.forge({ id: request.params.userId }).fetch().then(function (user) {

            return getStory(request.params.episodeTitle, request.params.seriesName, answers, user).then(function (story) {

                var context = {
                    oldStory: story.oldStory,
                    newStory: story.newStory,
                    answers: request.params.answers || [],
                    userId: request.params.userId,
                    episodeTitle: request.params.episodeTitle,
                    options: story.options
                };
                reply.view('episode', context);
            });
        });
    },
    // allows the moderator to pick a start template for an episode, effectively bypassing the
    // auto-selection based on user's cohort
    startEpisode: function (request, reply) {

        var userId = parseInt(request.payload.userId);
        models.Episode.forge({ title: request.payload.episodeTitle }).fetch().then(function (episode) {

            return episode.related('series').query({ where: { start: true } }).fetch().then(function (startSeries) {

                var title = episode.get('title');
                var context = {
                    // beginning of story, empty array
                    story: [],
                    startSeries: startSeries.toJSON(),
                    episodeTitle: episode.get('title'),
                    userId: userId
                };
                return reply.view('startEpisode', context);
            });
        });
    },
    startSeries: function (request, reply) {

        var path = ['', 'moderator', 'author', request.payload.userId, 'episode', request.payload.episodeTitle, request.payload.seriesName].join('/');
        reply().code(201).redirect(path + '#new-messages');
    },
    editEpisodes: function (request, reply) {

        return models.Episodes.forge().fetch().then(function (episodeCollection) {

            var context = {
                episodes: _.sortByOrder(episodeCollection.toJSON(), 'title')
            };
            reply.view('listEpisodesEdit', context);
        });
    },
    addEpisode: function (request, reply) {

        reply.view('addEpisode');
    },
    addTemplate: function (request, reply) {

        var episodeId = request.params.episodeId;
        var context = { episodeId: episodeId };
        reply.view('addTemplate', context);
    },
    createEpisode: function (request, reply) {

        var form = request.payload;
        var episodeBlob = _.omit(form, 'submit');
        return models.Episode.forge(episodeBlob).save().then(function (episodeModel) {

            var id = episodeModel.get('id');
            reply().code(201).redirect('/moderator/author/story/' + id);
        });
    },
    createTemplate: function (request, reply) {

        var form = request.payload;
        var templateType = form['template-type'];
        form.start = false;
        form.end = false;
        if (templateType === 'start') {
            form.start = true;
        } else if (templateType === 'end') {
            form.end = true;
        }
        var episodeId = form.episodeId;
        delete form.episodeId;
        delete form['template-type'];
        delete form.submit;
        var templateBlob = form;
        return models.Episode.where({ id: episodeId }).fetch().then(function (episodeModel) {

            return episodeModel.related('series').create(templateBlob).then(function () {

                return episodeModel.related('series').fetch().then(function (seriesCollection) {

                    var context = {
                        episode: episodeModel.toJSON(),
                        templates: _.sortByOrder(seriesCollection.toJSON(), 'start').reverse()
                    };
                    reply.view('listTemplatesEdit', context);
                });
            });
        });
    },
    editTemplates: function (request, reply) {

        var episodeId = request.params.episodeId;
        return models.Episode.where({ id: episodeId }).fetch().then(function (episodeModel) {

            return episodeModel.related('series').fetch().then(function (seriesCollection) {

                var context = {
                    episode: episodeModel.toJSON(),
                    templates: _.sortByOrder(seriesCollection.toJSON(), 'start').reverse()
                };
                reply.view('listTemplatesEdit', context);
            });
        });
    },
    editMessages: function (request, reply) {

        var episodeId = request.params.episodeId;
        var templateId = request.params.seriesId;
        return models.Series.where({ id: templateId }).fetch().then(function (seriesModel) {

            return seriesModel.related('messages').fetch().then(function (messageCollection) {

                var context = {
                    episodeId: episodeId,
                    messages: _.sortBy(messageCollection.toJSON(), 'id'),
                    template: seriesModel.toJSON()
                };
                reply.view('listMessagesEdit', context);
            });
        });
    },
    addMessage: function (request, reply) {

        var context = {};
        context.episodeId = request.params.episodeId;
        context.templateId = request.params.seriesId;
        reply.view('addMessage', context);

    },
    createMessage: function (request, reply) {

        var form = request.payload;
        var episodeId = form.episodeId;
        var templateId = form.series_id;
        delete form.submit;
        delete form.episodeId;
        var messageBlob = form;
        return models.Series.where({ id: templateId }).fetch().then(function (seriesModel) {

            return seriesModel.related('messages').create(messageBlob).then(function () {

                return seriesModel.related('messages').fetch().then(function (messageCollection) {

                    var context = {
                        episodeId: episodeId,
                        messages: _.sortBy(messageCollection.toJSON(), 'id'),
                        template: seriesModel.toJSON()
                    };
                    reply.view('listMessagesEdit', context);
                });
            });
        });
    },
    updateTemplate: function (request, reply) {

        var episodeId = request.params.episodeId;
        var templateId = request.params.seriesId;
        var form = request.payload;
        var templateType = form.type;
        var start = false;
        var end = false;
        if (templateType === 'start') {
            start = true;
        } else if (templateType === 'end') {
            end = true;
        }
        delete form.type;
        delete form.submit;
        var messages = {};
        _.forIn(form, function (value, key) {

            if (S(key).isNumeric()) {
                messages[key] = value;
            }
        });
        return models.Series.where({ id: templateId }).fetch().then(function (seriesModel) {

            return seriesModel.set({
                start: start,
                end: end
            }).save().then(function (savedSeries) {

                return savedSeries.related('messages').fetch().then(function (messageCollection) {

                    return messageCollection.mapThen(function (messageModel) {

                        var messageId = messageModel.get('id');
                        messageModel.set({
                            content: form[messageId],
                            wait: form[messageId + 'wait']
                        });
                        if (messageModel.hasChanged()) {
                            return messageModel.save();
                        }
                    }).then(function () {

                        reply().code(201).redirect('/moderator/author/story/' + episodeId + '/' + templateId);
                    });
                });
            });
        });
    }
};
