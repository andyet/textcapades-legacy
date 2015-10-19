var S = require('string');
var _ = require('lodash');
var logger = require('debug')('textcapade');
var tropoReceive = require('../../tropo/receive');
var slackReceive = require('../../slack/receive');
var Promise = require('bluebird');
var config = require('getconfig');
var postageapp = require('postageapp')(config.postageapp.apiKey);

var models = require('../models.js');

module.exports = {
    // displays a list of all states and the users currently at each states
    listEpisodes: function (request, reply) {

        // get all episodes
        models.Episodes.forge().fetch().then(function (episodeCollection) {

            var episodes = episodeCollection.toJSON();
            episodes = _.sortByOrder(episodes, 'title');
            var context = { episodes: episodes };
            reply.view('listEpisodes', context);
        });
    },
    listStates: function (request, reply) {

        var episodeId = request.params.episodeId;
        return models.Episode.where({ id: episodeId }).fetch().then(function (episodeModel) {

            episodeModel.related('series').fetch().then(function (seriesCollection) {

                var states = _.sortByOrder(seriesCollection.toJSON(), 'name');
                // need to create relation between user and series/state
                return models.Users.forge().fetch().then(function (userCollection) {

                    var users = _.sortByOrder(userCollection.toJSON(), 'name');
                    var context = {
                        states: states,
                        users: users
                    };
                    reply.view('listStates', context);
                });
            });
        });
    },
    // starts user in their current episode
    startUser: function (request, reply) {

        logger('Manually starting user %s', request.params.userId);
        var userId = request.params.userId;

        models.User.getByAttrs({ id: userId }).then(function (user) {

            var context = { user: user.toJSON() };

            var key = user.get('validate_key');
            var name = user.get('name');
            var phone = user.get('phone');
            var email = user.get('email');

            var emailConfig = {
                'recipients': [email],
                'subject' : 'A new textcapade episode is about to begin!',
                'from' : '&yetConf Team <conf@andyet.com>',
                'template' : 'confirm_start_episode',
                'variables' : {
                    'name' : name,
                    'phone' : phone
                }
            };

            if (!user) {
                context.error = 'User not found';
                return reply.view('userDetail', context);
            }

            if (!user.get('phone')) {
                logger('Cannot start user %s with no phone', user.get('id'));
                context.error = 'Cannot start user without a phone number.';
                return reply.view('userDetail', context);
            }

            if (user.get('active')) {
                logger('Cannot start an already active user %s', user.get('id'));
                context.error = 'Cannot start an already active user (try restart instead)';
                return reply.view('userDetail', context);
            }

            return user.start()
            .then(function () {

                postageapp.sendMessage(emailConfig, function callback () {

                    logger('%s has started a new episode, email sent to %s', name, email);
                }, function err (err) {

                    logger('Something went wrong mailing %s %j', email, arguments);
                });

                return reply().state('message', 'User is now in active play').redirect('/moderator/' + userId);


            }).catch(function (err) {

                logger('Error sending next series for user %s %j', user.get('id'), err.stack);
                context.error = 'Error sending messages for user. Check the logs.';
                return reply.view('userDetail', context);
            });
        });
    },
    // restarts user in their current episode
    restartUser: function (request, reply) {

        logger('Manually restarting user %s', request.params.userId);
        var userId = request.params.userId;

        models.User.getByAttrs({ id: userId }).then(function (user) {

            var context = { user: user.toJSON() };

            if (!user) {
                context.error = 'User not found';
                return reply.view('userDetail', context);
            }

            if (!user.get('active')) {
                context.error = 'Cannot restart an inactive user (try start instead)';
                return reply.view('userDetail', context);
            }

            return user.related('history').fetch().then(function (histories) {

                return histories.models;
            })
            .each(function (history) {

                return history.destroy();
            })
            .then(function () {

                return user.save({ ready_to_receive: false }, { patch: true });
            })
            .then(function () {

                return user.setStartSeriesForCurrentEpisode();
            })
            .then(function () {

                return user.sendNextSeriesMessages();
            }).then(function () {

                return reply().state('message', 'User play has now restarted from the beginning of the episode.').redirect('/moderator/' + userId);
            }).catch(function (err) {

                logger('Error sending next series for user %s %j', user.get('id'), err);
                context.error = 'Error sending next series for user.';
                return reply.view('userDetail', context);
            });
        });
    },
    answerUser: function (request, reply) {

        var userId = request.params.userId;
        logger('Manually answering for user %s %s', userId, request.payload.user_response);

        return models.User.getByAttrs({ id: userId }).then(function (user) {

            var context = { user: user.toJSON() };

            return user.parseResponse(request.payload.user_response, 'moderator').then(function () {

                return reply().state('message', 'Answer manually received for user. Please refresh page in 5 seconds to see newest answers').redirect('/moderator/' + userId);
            });
        });
    },
    // This is the webhook for Tropo
    // passes received message to tropo receiver
    tropoReceive: function (request, reply) {

        logger('Tropo webhook received %j', request.payload);
        tropoReceive.receive(request.payload);
        reply('OK');
    },
    // This is the webhook for Slack
    // passes received message to slack receiver
    slackReceive: function (request, reply) {

        logger('Slack webhook received %j', request.payload);
        slackReceive.receive(request.payload);
        reply('OK');
    }
};
