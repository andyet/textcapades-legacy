var S = require('string');
// var config = require('getconfig');
var _ = require('lodash');
var Promise = require('bluebird');
var logger = require('debug')('textcapade');
var config = require('getconfig');
var moment = require('moment');
var postageapp = require('postageapp')(config.postageapp.apiKey);

var models = require('../models.js');


module.exports = {
    // main page for mod with lots of stuff they can do
    main: function (request, reply) {

        return Promise.all([
            models.Users.forge().fetch({ withRelated: ['episode', 'lastSeries'] }),
            models.Cohorts.forge().fetch(),
            models.Territories.forge().fetch(),
            models.Episodes.forge().fetch()
        ]).then(function (result) {

            var users = result[0];
            var cohorts = result[1];
            var territories = result[2];
            var episodes = result[3];

            var context = {
                message: request.state.message,
                users: _.sortByOrder(users.toJSON(), 'name'),
                cohorts: _.sortByOrder(cohorts.toJSON(), 'name'),
                territories: _.sortByOrder(territories.toJSON(), 'territories'),
                episodes: _.sortByOrder(episodes.toJSON(), 'title'),
                moment: moment
            };

            reply.view('moderator', context).unstate('message');
        });
    },
    // // allows mod to choose start template for a user
    assignTemplate: function (request, reply) {

        var userId = request.params.userId;
        models.User.forge({ id: userId }).fetch({ withRelated: ['episode', 'episode.series', 'nextSeries'] }).then(function (user) {

            var states = _.sortByOrder(user.related('episode').related('series').toJSON(), 'start').reverse();
            var context = {
                templates: states,
                user: user.toJSON()
            };
            reply.view('assignTemplate', context);
        });
    },
    // view properties of the user
    viewUser: function (request, reply) {

        models.User.getByAttrs({ id: request.params.userId }).then(function (user) {

            if (!user) {
                return reply('user not found').code(404);
            }
            var context = { user: user.toJSON(), message: request.state.message };
            reply.view('userDetail', context).unstate('message');
        });
    },
    // displays editable properties of the user
    editUser: function (request, reply) {

        return Promise.all([
            models.User.where({ id: request.params.userId }).fetch({ withRelated: ['episode', 'episode.series'] }),
            models.Cohorts.forge().fetch(),
            models.Territories.forge().fetch(),
            models.Episodes.forge().fetch()
        ]).then(function (result) {

            var user = result[0].toJSON();
            var cohorts = result[1];
            var territories = result[2];
            var episodes = result[3];
            // get relevant templates
            if (user.episode) {
                user.episode.series = _.sortByOrder(user.episode.series, 'start').reverse();
            }

            var context = {
                user: user,
                cohorts: _.sortByOrder(cohorts.toJSON(), 'name'),
                territories: _.sortByOrder(territories.toJSON(), 'name'),
                episodes: _.sortByOrder(episodes.toJSON(), 'title')
            };
            reply.view('userEdit', context);
        });
    },
    // creates a new user in the db
    createUser: function (request, reply) {

        logger('createUser payload %j', request.payload);
        var form = request.payload;
        var phone = form.phone;
        var userData = _.omit(form, 'episode_title', 'phone');
        var episodeTitle = 'episode1';
        userData.answer_blob = {};
        return models.Episode.forge({ title: episodeTitle }).fetch({ withRelated: ['series'] }).then(function (episode) {

            userData.episode_id = episode.id;
            return models.Series.forge({ episode_id: episode.id, start: true }).fetch().then(function (series) {

                userData.next_series_id = series.id;
                return models.User.forge(userData).save();
            });
        }).then(function (user) {

            if (phone) {
                return user.setPhoneNumber(phone);
            }

        }).then(function () {

            return reply().redirect('/moderator');
        });
    },
    // allows the moderator to update the user model
    updateUser: function (request, reply) {

        logger('updateUser %j', request.payload);
        var form = request.payload;
        var redirect = form.redirect;
        var phone = form.phone;
        // delete redirect key
        delete form.redirect;
        delete form.phone;
        // remove empty elements from the form
        form = _.omit(form, function (el) {

            if (!el) { return true; }
        });
        var episodeTitle = form.episode_title;
        delete form.episode_title;
        return models.Episode.forge({ title: episodeTitle }).fetch({ withRelated: ['series'] }).then(function (episode) {

            return models.User.forge({ id: request.params.userId }).fetch({ withRelated: ['episode'] }).then(function (user) {

                if (episodeTitle &&
                    episodeTitle !== user.episode().get('title')) {

                    form.episode_id = episode.get('id');
                    return episode.getStartSeriesForCohort(Number(form.cohort_id), true).then(function (startSeries) {

                        form.next_series_id = startSeries.get('id');
                        return user;
                    });
                }
                return user;
            }).then(function (user) {

                var first = function () {

                    if (user.get('active') &&
                        form.episode_id !== user.get('episode_id')) {

                        form.active = false;
                        return user.related('history').fetch().then(function (collection) {

                            return collection.models;
                        })
                        .each(function (model) {

                            return model.destroy();
                        });
                    }

                    return Promise.resolve();
                };

                first().then(function () {

                    return user.save(form, { patch: true });
                })
                .then(function () {

                    if (phone) {
                        return user.setPhoneNumber(phone);
                    }
                })
                .then(function () {

                    if (redirect === 'moderator') {
                        reply().code(201).redirect('/moderator');
                    }
                    else if (redirect === 'users') {
                        reply().code(201).redirect('/moderator/users');
                    }
                });
            });
        });
    },
    // deletes the user model from the db
    deleteUser: function (request, reply) {

        var form = request.payload;
        var idsToDelete = form.selectedUsers;
        return Promise.map(idsToDelete, function (id) {

            return models.User.where({ id: id }).fetch().then(function (user) {

                if (!user) {
                    return;
                }
                // remove related history
                return user.related('history').fetch().then(function (historyCollection) {

                    return historyCollection.mapThen(function (history) {

                        return history.destroy();
                    });
                }).then(function () {

                    return user.related('numberPool').fetch().then(function (pool) {

                        // destroy user
                        return user.destroy().then(function () {

                            if (pool) {
                                return pool.remove();
                            }
                        });
                    });
                });
            });
        })
        .then(function () {

            reply().code(201).redirect('/moderator');
        });
    },
    sendValidationEmail: function (request, reply) {

        var userId = Number(request.params.userId);

        models.User.where({ id: userId }).fetch({ withRelated: ['episode'] }).then(function (user) {

            if (!user) {
                return reply('User ' + userId + ' not found');
            }

            var context = { user: user.toJSON() };

            var key = user.get('validate_key');
            var name = user.get('name');
            var email = user.get('email');

            var emailConfig = {
                'recipients': [email],
                'subject' : '&yetConf starts now. With a textcapade.',
                'from' : '&yetConf Team <conf@andyet.com>',
                'template' : 'welcome_start_play',
                'variables' : {
                    'name' : name,
                    'key' : key
                }
            };

            postageapp.sendMessage(emailConfig, function callback () {

                logger('%s has been invited to play textcapades, email sent to %s', name, email);
                context.message = 'Message has been sent.';
                reply.view('userDetail', context);
            }, function err (err) {

                logger('Something went wrong mailing %s %j', email, arguments);
                context.message = 'There was an error sending the email. Please check the logs.';
                reply.view('userDetail', context);
            });
        });
    },
    bulkForm: function (request, reply) {

        var validate = function () {

            var errors = [];
            return Promise.resolve(request.payload.selectedUsers).each(function (id) {

                id = Number(id);
                return models.User.where({ id: id }).fetch().then(function (userModel) {

                    if (userModel.get('validated')) {
                        errors.push(userModel.get('id'));
                        return Promise.resolve();
                    }

                    var user = userModel.toJSON();
                    var emailConfig = {
                        recipients: [user.email],
                        subject: '&yetConf starts now. With a textcapade.',
                        from: '&yetConf Team <conf@andyet.com>',
                        template: 'welcome_start_play',
                        variables: {
                            name: user.name,
                            key: user.validate_key
                        }
                    };

                    return new Promise(function (resolve, reject) {

                        postageapp.sendMessage(emailConfig, function () {

                            logger('%s has been invited to play textcapades, email sent to %s', user.name, user.email);
                            return resolve();
                        }, function (err) {

                            logger('Something went wrong mailing %s %j', email, arguments);
                            return reject(err);
                        });
                    });
                });
            }).then(function () {

                if (errors.length) {
                    return 'Users ' + errors.join(', ') + ' were already activated, so email was skipped';
                }
            });
        };

        var destroy = function () {

            return Promise.resolve(request.payload.selectedUsers).each(function (id) {

                id = Number(id);
                return models.User.where({ id: id }).fetch({ withRelated: ['history', 'numberPool'] }).then(function (user) {

                    if (!user) {
                        return Promise.resolve();
                    }

                    return Promise.resolve(user.related('history').models).each(function (item) {

                        return item.destroy();
                    }).then(function () {

                        var pool = user.related('numberPool');
                        return user.destroy().then(function () {

                            if (!pool.id) {
                                return Promise.resolve();
                            }

                            return pool.remove();
                        });
                    });
                });
            }).then(function () {

                return;
            });
        };

        var episode = function () {

            var errors = [];
            return models.Episode.forge({ title: request.payload.episode }).fetch({ withRelated: ['series'] }).then(function (foundEpisode) {

                var seriesStart = foundEpisode.related('series').models.filter(function (series) {

                    return series.get('start');
                })[0];

                return Promise.resolve(request.payload.selectedUsers).each(function (id) {

                    id = Number(id);
                    return models.User.where({ id: id }).fetch({ withRelated: ['history', 'nextSeries'] }).then(function (user) {

                        if (user.get('active') &&
                            (user.related('history').where({ sent: false }).length ||
                             !user.related('nextSeries').get('end'))) {

                            errors.push(user.get('id'));
                            return Promise.resolve();
                        }

                        return user.save({ episode_id: foundEpisode.get('id'), next_series_id: seriesStart.get('id') }, { patch: true });
                    });
                });
            }).then(function () {

                if (errors.length) {
                    return 'Users ' + errors.join(', ') + ' are currently active and were not changed';
                }
            });
        };

        var action;
        if (request.payload.action === 'validate') {
            action = validate;
        }
        else if (request.payload.action === 'delete') {
            action = destroy;
        }
        else if (request.payload.action === 'episode') {
            action = episode;
        }

        action().then(function (msg) {

            return reply().redirect('/moderator').state('message', msg);
        });
    },
    listUsers: function (request, reply) {

        return Promise.all([
            models.Users.forge().fetch()
        ]).then(function (result) {

            var users = _.sortByOrder(result[0].toJSON(), 'name');
            var context = {
                users: users
            };

            reply.view('listUsers', context);
        });
    }
};
