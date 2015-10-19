var _ = require('lodash');
var S = require('string');
var models = require('../models');
var config = require('getconfig');
var postageapp = require('postageapp')(config.postageapp.apiKey);
var logger = require('debug')('textcapade');
var vcards = require('../../vcards');
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

module.exports = {
    index: function (request, reply) {

        reply.view('index');
    },
    signupForm: function (request, reply) {

        reply.view('signup-public');
    },

    // directs the user to a page where they enter their phone number
    // if their uuid has already been confirmed they are directed to an error page
    activate: function (request, reply) {

        models.User.where({ validate_key: request.params.validationKey }).fetch().then(function (user) {

            if (!user) {
                return reply.view('error-public', { message: 'Sorry you have an invalid link! Please contact conf@andyet.com for help.' });
            }

            var isValidated = user.get('validated');
            if (isValidated === false) {
                var context = { user: user.toJSON() };
                return reply.view('validateForm', context);
            }
            if (isValidated === true) {
                return reply.view('error-public', { message: 'Looks like you already registered! If you\'re having trouble, please contact us at conf@andyet.com.' });
            }
            return reply.view('error-public', { message: 'Sorry you have an invalid link! Please contact conf@andyet.com for help.' });
        });

    },

    activateSlack: function (request, reply) {

        models.User.where({ validate_key: request.params.validationKey }).fetch().then(function (user) {

            var isValidated = user.get('validated');
            if (isValidated === false) {
                var context = { user: user.toJSON() };
                return reply.view('validateFormSlack', context);
            }
            if (isValidated === true) {
                return reply.view('error-public', { message: 'Looks like you already registered! If you\'re having trouble, please contact us at conf@andyet.com.' });
            }
            return reply.view('error-public', { message: 'Sorry you have an invalid link! Please contact conf@andyet.com for help.' });
        });

    },
    // parses and saves the phone number that they entered
    // sets the 'validated' parameter on the user model to true which prevents them from reusing their link
    // also generates a phone number pool for the user and assigns it to them
    setPhone: function (request, reply) {

        var userId = request.params.userId;
        var phone = request.payload.phone;
        var validate_key = request.payload.validate_key;

        models.User.forge({ id: userId, validate_key: validate_key }).fetch().then(function (user) {

            if (!user) {
                return reply.view('error-public', { message: 'Sorry you have an invalid link! Please contact conf@andyet.com for help.' });
            }

            var parsed = user.parseNumber(phone);
            if (parsed instanceof Error ||
                !phoneUtil.isValidNumber(parsed)) {

                logger('Error setting phone number %s for user %s: number invalid', phone, user.get('id'));
                return reply.view('error-public', { message: 'That phone number doesn\'t appear to be valid. Please try again or contact us at conf@andyet.com.' });
            }

            var tail = request.tail('setPhoneNumber');

            user.setPhoneNumber(phone)
            .then(function (savedUser) {

                var context = { user: user.toJSON() };
                var name = user.get('name');
                var email = user.get('email');
                var userPhone = user.get('phone');
                if (userPhone === 'slack') {
                    userPhone = userPhone + '/' + user.get('slack_username');
                }

                user.start()
                .then(function () {

                    user.related('numberPool').fetch().then(function (pool) {

                        var emailConfig = {
                            'recipients': [email],
                            'subject' : 'Your textcapade starts soon. Here\'s what you need to know.',
                            'from' : '&yetConf Team <conf@andyet.com>',
                            'attachments': vcards.generate(pool),
                            'template' : 'confirm_start_play',
                            'variables' : {
                                'name' : name,
                                'phone' : userPhone
                            }
                        };

                        //Postageapp happens in the background
                        postageapp.sendMessage(emailConfig, function callback () {

                            logger('%s has initiated textcapades at %s, email sent to %s', user.get('id'), phone, email);
                            tail();
                        }, function err () {

                            logger('Something went wrong mailing %s %j', email, arguments);
                            tail();
                        });
                    });
                })
                .catch(function (err) {

                    logger('Error sending next series for user %s %j', user.get('id'), err.stack);
                    tail();
                });

            })
            .catch(function (err) {

                logger('Error setting phone number %s for user %s: %s', phone, user.get('id'), err);
                tail();
            });

            reply.view('success-public', { message: 'Thanks! You\'re all set. You should be hearing from us soon.' });
        });
    },

    submitSignup: function submitSignup (request, reply) {

        var name = request.payload.name;
        var email = request.payload.email;

        var emailConfig = {
            'recipients': ['conf@andyet.com'],
            'subject' : name + ' signed up for textcapades!',
            'from' : email,
            'template' : 'public_signup',
            'variables' : {
                'name' : name,
                'email' : email
            }
        };

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
                return models.User.forge(userData).save().then(function (savedUser) {

                    postageapp.sendMessage(emailConfig, function callback () {

                        logger('%s is requesting to play textcapades. Email: %s', name, email);
                        reply.view('success-public', { message: 'Thanks for signing up! The adventure starts soon!' });
                    }, function err () {

                        logger('Something went wrong mailing %s %j', email, arguments);
                        reply.view('error-public', { message: 'Your signup has not been submitted. Please contact us at conf@andyet.com.' });
                    });

                });
            });
        });

    },

    submitSlack: function submitSlack (request, reply) {

        var name = request.payload.name;
        var email = request.payload.email;

        var emailConfig = {
            'recipients': ['conf@andyet.com'],
            'subject' : name + ' wants to play textcapades via Slack!',
            'from' : email,
            'template' : 'confirm_start_play_slack',
            'variables' : {
                'name' : name,
                'email' : email
            }
        };

        postageapp.sendMessage(emailConfig, function callback () {

            logger('%s is requesting to play textcapades via slack, email sent to %s', name, email);
            reply.view('success-public', { message: 'Your request has been submitted. Expect an invite soon!' });
        }, function err () {

            logger('Something went wrong mailing %s %j', email, arguments);
            reply.view('error-public', { message: 'Your request has not been submitted. Please contact us at conf@andyet.com.' });
        });

    },

    userHistory: function userHistory (request, reply) {

        var perPage = 50;
        var page = Number(request.query.page) || 0;
        var attrs = {};
        if (request.params.phoneNumber === 'slack') {
            //Bad links from previous emails
            return reply().redirect('/');
        }
        if (request.params.slackUsername) {
            attrs.phone = 'slack';
            attrs.slack_username = request.params.slackUsername;
        } else {
            attrs.phone = request.params.phoneNumber;
        }

        models.User.forge(attrs).fetch({
            required: true
        })
        .then(function (user) {

            user.related('history').query(function () {

                //this.where('time', '<', models.Bookshelf.knex.raw('extract(epoch from CURRENT_TIMESTAMP)'));
                //Or we can just filter on sent lmbo --Gar
                this.where({ sent: true });
                this.orderByRaw('time, seq ASC');
            }).fetch()
            .then(function (history) {

                var pages = Math.ceil(history.length / perPage);
                //if (pages * perPage >= history.length && pages > 1) {
                    //pages = pages - 1;
                //}
                if (pages === 0) {
                }
                if (page === 0 || page > pages) {
                    page = pages;
                }
                var sliceEnd = (perPage * page);
                var sliceStart = sliceEnd - perPage;
                reply.view('userHistory', {
                    pages: pages,
                    page: page,
                    history: user.related('history').toJSON().slice(sliceStart, sliceEnd)
                });
            });
        });
    }
};
