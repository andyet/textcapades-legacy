var config = require('getconfig');
var knex = require('knex')(config.db);
var Bookshelf = require('bookshelf')(knex);
var Promise = require('bluebird');
var moment = require('moment');
var _ = require('lodash');
var S = require('string');
var logger = require('debug')('textcapade');
var smsChars = require('./utils/smsChars');
var decisions = require('../decisions');
var tropo = require('../tropo/api');
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var generateErrorMessage = require('./utils/generateErrorMessage');
var validate = require('../tropo/dataValidation').validate;

// Model for user
var User = Bookshelf.Model.extend({
    /*
     * users.increments('id').notNullable().primary();
     * users.string('name');
     * users.string('rtc_name');
     * users.string('email');
     * users.string('phone');
     * users.json('decision_blob');
     * users.json('answer_blob');
     * users.uuid('validate_key').notNullable().defaultTo(knex.raw('uuid_generate_v4()'));
     * users.boolean('ready_to_receive').notNullable().defaultTo(true);
     * users.boolean('validated').notNullable().defaultTo(false);
     * users.integer('next_series_id').references('series.id');
     * users.integer('last_series_id').references('series.id');
     * users.integer('episode_id').references('episodes.id');
     * users.integer('territory_id').references('territories.id');
     * users.integer('cohort_id').references('cohorts.id');
     * users.integer('number_id').references('numbers.id');
     */

    tableName: 'users',


    history: function () {

        return this.hasMany(History);
    },
    episode: function () {

        return this.belongsTo(Episode);
    },
    //This is the next series to send to the user
    nextSeries: function () {

        return this.belongsTo(Series, 'next_series_id');
    },
    //This is the last series that was sent to the user
    lastSeries: function () {

        return this.belongsTo(Series, 'last_series_id');
    },
    cohort: function () {

        return this.belongsTo(Cohort);
    },
    numberPool: function () {

        return this.belongsTo(NumberPool);
    },

    /*
     * Saves the phone number for this user,
     * Putting them in a number pool at the same time
     * assignment to appropriate pools (US in US pool, INTL in INTL pool)
     */
    parseNumber: function (number) {

        try {
            return phoneUtil.parse(number, 'US');
        }
        catch (e) {
            return e;
        }
    },
    setPhoneNumber: function (number) {

        var self = this;

        var parsed = number;

        if (number !== 'slack') {
            parsed = self.parseNumber(number, 'US');
            if (parsed instanceof Error ||
                !phoneUtil.isValidNumber(parsed)) {

                return Promise.reject('Invalid phone number ' + number);
            }
            number = phoneUtil.format(parsed, 0);
        }

        //Number should be +1 formatted now or === 'slack'
        if (this.get('number_id') || number === 'slack') {
            //Don't switch pools once we've assigned one
            //Don't bother with pools if we're setting to slack
            return self.save({ phone: number, validated: true }, { patch: true });
        }

        // provision some numbers in tropo and create a pool to assign the user to
        var prefix = parsed.getCountryCode() === 1 ? number.slice(1, 5) : '1403'; // hardcode canada if they're international
        var finish = function (numbers) {

            return NumberPool.forge({ lachesis: numbers[0], atropos: numbers[1], clotho: numbers[2] }).save().then(function (pool) {

                // the require is here on purpose because of caching and circular dependencies
                // leave it here until the models are all split up
                require('../tropo/worker').addWorker(pool);
                return self.save({ number_id: pool.get('id'), phone: number, validated: true }, { patch: true });
            });
        };

        return tropo.provisionNumbers(prefix).then(finish).catch(function (err) {

            logger('got an error provisioning numbers %j', err);
            return tropo.provisionNumbers('1').then(finish).catch(function (err) {

                logger('really got an error provisioning numbers %j', err);
                throw err;
            });
        });
    },
    /*
        Input: - message: a string
        Returns: Nothing
        Saves the message to the user history
    */
    saveToHistory: function (payload) {

        return this.related('history').create({
            message_type: 'received',
            message: payload.message,
            time: payload.time || moment().unix(),
            from_phone: payload.from,
            sent: true
        });
    },
    /*
        Input: None

        Returns: A promise resolving to a JSON containing the
        messages, wait times, and decisionBlob for the user

        gets decision data from the series and message data from related message models

    */
    getMessages: function () {

        var self = this;

        return this.nextSeries().fetch({ withRelated: ['messages'] }).then(function (series) {

            var decisionBlob = series.translateDecisions(self);
            var messages = series.related('messages');
            messages.comparator = 'series_seq';
            messages.sort();

            return {
                messages: messages,
                decisionBlob: decisionBlob
            };
        });
    },

    //Send an incidental message to the user from one of the columns in their
    //numbers
    sendMessage: function (conferenceMessage) {

        var self = this;

        return Promise.resolve().then(function () {

            if (self.get('phone') === 'slack') {
                //Don't judge me
                return {
                    get: function () {

                        return 'slack';
                    }
                };
            }
            return self.related('numberPool').fetch();
        })
        .then(function (numberPool) {

            var from_character = conferenceMessage.get('from_character');
            var from_phone = self.related('numberPool').get(from_character);
            return self.related('history').create({
                message_type: 'send',
                message: conferenceMessage.get('content'),
                time: conferenceMessage.get('time').unix(),
                sent: false,
                from_phone: from_phone,
                from_character: from_character,
                seq: 0
            });
        });
    },

    start: function () {

        var self = this;
        return Promise.resolve().then(function () {

            if (!self.get('next_series_id')) {
                return self.setStartSeriesForCurrentEpisode();
            }

            return;
        })
        .then(function () {

            logger('Sending next message for user %s', self.get('id'));
            return self.sendNextSeriesMessages();
        })
        .then(function () {

            logger('Setting user %s active', self.get('id'));
            return self.save({ active: true }, { patch: true });
        });
    },
    setStartSeriesForCurrentEpisode: function () {

        var self = this;

        return this.episode().fetch({ require: true }).then(function (episode) {

            return episode.getStartSeriesForCohort(self.get('cohort_id')).then(function (series) {

                logger('Saving start series %s for user %s (%s) current episode %s', series.get('name'), self.get('id'), self.get('phone'), episode.get('title'));
                return self.save({
                    next_series_id: series.get('id')
                }, { patch: true });
            });
        });
    },

    sendNextSeriesMessages: function () {

        var self = this;
        var timeToSend = moment();

        return this.getMessages().then(function (data) {

            return Promise.resolve(data.messages.models).each(function (message) {

                var wait = message.get('wait');
                if (wait === 0) {
                    /*
                     * Unless otherwise specified we want message to take between 15 to 22 seconds,
                     * depending on the length of the message. Maximum length of messages is 160
                     *
                     * 160/20 = 8
                     *
                     * Math.round(messageLength / 20) + 16, gives us a range of [16, 24]
                     *
                     * We then randomly take away up to 1/4 of that time to make things more organic.
                     */
                    var messageLength = message.get('content').length;
                    wait = Math.round(messageLength / 20) + 16;
                    wait = Math.round(wait - (Math.random() * (wait / 4)));
                }
                /*
                 * Ok this is a hopefully temporary shim to try to limit the messages from a given number
                 * to a user to under 5 per minute which appears to be a limit set downstream of tropo
                 * (12 seconds is 5 per minute so we wait 13 to stay under 5)
                 */
                if (wait < 15) {
                    wait = 15;
                }

                if (config.getconfig.env === 'dev') {
                    wait = 1;
                }

                timeToSend.add(wait, 'seconds');
                return self.saveMessageToHistory(message, timeToSend.unix());
            })
            .then(function () {

                return self.save({
                    ready_to_receive: false,
                    decision_blob: data.decisionBlob
                }, { patch: true });
            });
        });
    },

    attemptAdvance: function () {

        var self = this;

        return History.where({ user_id: this.id, sent: false }).fetchAll().then(function (histories) {

            if (histories.length !== 0) {
                return;
            }

            var decisionBlob = self.get('decision_blob');

            if (decisionBlob.validOptions.length === 1 && decisionBlob.validOptions[0] === 'continue') {
                return self.receiveValidatedResponse('continue');
            }

            logger('Setting user %s (%s) ready to receive', self.get('id'), self.get('phone'));

            return self.save({
                last_series_id: self.get('next_series_id'),
                last_series_completed: new Date(),
                ready_to_receive: true
            }, { patch: true });
        });
    },

    parseResponse: function (message, from) {

        var self = this;

        //message is straight from user input
        return this.saveToHistory({
            message: message,
            from: from
        }).then(function () {

            return validate(message, self.get('decision_blob').validOptions).then(function (response) {

                logger('Valid response from %s (%s): %j', self.get('id'), self.get('phone'), response);

                if (!response.isValid) {
                    return self.sendErrorMessage();
                }

                return self.receiveValidatedResponse(response.validInput);
            });
        });
    },

    receiveValidatedResponse: function (input) {

        var self = this;

        return Promise.join(
            this.episode().fetch(),
            this.nextSeries().fetch()
        ).spread(function (episode, series) {

            var answerBlob = self.get('answer_blob') || {};
            if (input !== 'continue') {
                answerBlob[series.get('name')] = input;
            }
            self.save({ answer_blob: answerBlob }, { patch: true }).then(function () {

                /*
                 * decisionFunction result example: { nextSeries: 'foo', cohort: 'bar', nextEpisode: 'baz' }
                 * if nextSeries === 'end' then look to nextEpisode to set next episode (can be none)
                 * if cohort is set, set the user's cohort
                 */
                var decisionFunction = decisions[episode.get('title')][series.get('name')];
                var userBlob = self.toJSON();
                userBlob.first_name = self.first_name;
                userBlob.last_name = self.last_name;
                var decision = decisionFunction(input, userBlob);
                logger('User %s (%s) episode %s decided %s resulting in %j', self.get('id'), self.get('phone'), episode.get('title'), input, series.get('name'), decision);
                return decision;
            }).then(function (decision) {
                //If we're changing cohort translate to cohort_id
                if (!decision.cohort) {
                    decision.cohort = self.get('cohort_id');
                    return decision;
                }
                return Cohort.forge({ name: decision.cohort }).fetch().then(function (cohort) {

                    decision.cohort = cohort.get('id');
                    return decision;
                });
            }).then(function (decision) {

                if (!decision.alignment) {
                    return decision;
                }
                return self.save({ alignment: decision.alignment }, { patch: true }).then(function () {

                    return decision;
                });
            }).then(function (decision) {

                if (decision.nextSeries !== 'end') {
                    decision.nextEpisode = self.get('episode_id');
                    return Series.forge({ name: decision.nextSeries }).fetch({ require: true }).then(function (nextSeries) {

                        decision.nextSeries = nextSeries.get('id');
                        return decision;
                    });
                }
                logger('User %s (%s) is at end of episode. Next episode: %s', self.get('id'), self.get('phone'), decision.nextEpisode);
                if (!decision.nextEpisode) {
                    decision.nextSeries = null;
                    return decision;
                }
                return Episode.forge({ title: decision.nextEpisode }).fetch({ require: true }).then(function (nextEpisode) {

                    decision.nextEpisode = nextEpisode.get('id');
                    return nextEpisode.getStartSeriesForCohort(decision.cohort).then(function (startSeries) {

                        decision.nextSeries = startSeries.get('id');
                        return decision;
                    });
                });
            }).then(function (decision){

                if (!decision.nextSeries) {
                    logger('Setting user %s (%s) not ready to receive (end of story)', self.get('id'), self.get('phone'));

                    return self.save({
                        next_series_id: null,
                        ready_to_receive: false,
                        cohort_id: decision.cohort
                    }, { patch: true });
                }
                logger('Setting user %s (%s) not ready to receive (starting next series)', self.get('id'), self.get('phone'));
                return self.save({
                    next_series_id: decision.nextSeries,
                    episode_id: decision.nextEpisode,
                    ready_to_receive: false,
                    cohort_id: decision.cohort
                }, { patch: true }).then(function () {

                    return self.sendNextSeriesMessages();
                });
            });
        });
    },

    sendErrorMessage: function () {

        var self = this;
        return Promise.resolve().then(function () {

            if (self.get('phone') === 'slack') {
                //Don't judge me
                return {
                    get: function () {

                        return 'slack';
                    }
                };
            }
            return self.related('numberPool').fetch();
        }).then(function (numberPool) {

            return self.related('episode').fetch().then(function (episode) {

                var from_character = episode.get('from_character');
                var from_phone = numberPool.get(from_character);
                return self.related('history').create({
                    message_type: 'send',
                    message: generateErrorMessage(self.get('decision_blob').validOptions),
                    time: moment().add(1, 'seconds').unix(),
                    sent: false,
                    from_phone: from_phone,
                    from_character: from_character,
                    seq: 0
                });
            });
        });
    },

    /*
     * Save a given message to the history
     * lastMessageTime is the (optional) time the message before was to be sent
     */
    saveMessageToHistory: function (message, timeToSend) {

        var userBlob = this.toJSON();
        userBlob.first_name = this.first_name;
        userBlob.last_name = this.last_name;
        var content = message.get('content');

        // check if the message needs interpolated values from the user
        if (content.indexOf('{{') > -1) {
            // handle interpolation with the string.js template()
            content = S(content).template(userBlob).s;
        }

        var self = this;

        return Promise.resolve().then(function () {

            if (self.get('phone') === 'slack') {
                //Don't judge me
                return {
                    get: function () {

                        return 'slack';
                    }
                };
            }
            return self.related('numberPool').fetch();
        }).then(function (numberPool) {

            return message.related('episode').fetch().then(function (episode) {

                var from_character = episode.get('from_character');
                var from_phone = numberPool.get(from_character);
                return self.related('history').create({
                    message_type: 'send',
                    message: content,
                    time: timeToSend,
                    sent: false,
                    from_phone: from_phone,
                    from_character: from_character,
                    seq: message.get('series_seq')
                });
            });
        });
    }
}, {
    getByAttrs: function (attrs) {

        return this.forge(attrs).fetch({ withRelated: ['episode', 'episode.series', 'nextSeries', 'nextSeries.messages', 'lastSeries', 'lastSeries.messages', 'cohort', 'numberPool'] });
    }
});

Object.defineProperty(User.prototype, 'first_name', {
    get: function () {

        var fullName = this.get('name');
        var cutOff = fullName.indexOf(' ');
        if (cutOff === -1) {
            cutOff = undefined;
        }
        return fullName.slice(0, cutOff);
    },
    enumerable: true
});

Object.defineProperty(User.prototype, 'last_name', {
    get: function () {

        var fullName = this.get('name');
        return fullName.slice(fullName.indexOf(' ') + 1);
    },
    enumerable: true
});

var NumberPool = Bookshelf.Model.extend({
    /*
     * numbers.increments('id').notNullable().primary();
     * numbers.boolean('international').defaultTo(false);
     * numbers.text('lachesis');
     * numbers.text('atropos');
     * numbers.text('clotho');
     */
    tableName: 'numbers',

    users: function () {

        return this.hasMany(User);
    },

    remove: function () {

        var self = this;
        return tropo.removeNumber(self.get('lachesis')).then(function () {

            return tropo.removeNumber(self.get('atropos'));
        }).then(function () {

            return tropo.removeNumber(self.get('clotho'));
        }).then(function () {

            return self.destroy();
        });
    }
});

// Model for message
var Message = Bookshelf.Model.extend({
    /*
     * messages.increments('id').notNullable().primary();
     * messages.text('content').notNullable();
     * messages.integer('series_id').references('series.id').index();
     * messages.integer('wait').defaultTo(0);
     */
    tableName: 'messages',

    series: function () {

        return this.belongsTo(Series);
    },

    episode: function () {

        return this.belongsTo(Episode).through(Series);
    },

    initialize: function () {

        this.on('saving', this.validateSave);
    },

    validateSave: function (model) {

        return model.set({ content: smsChars.replaceInvalid(model.get('content')) });
    }


});

// Model for user history
var History = Bookshelf.Model.extend({
    tableName: 'history',

    user: function () {

        return this.belongsTo(User);
    }
});

// Model for cohort
var Cohort = Bookshelf.Model.extend({
    tableName: 'cohorts',

    users: function () {

        return this.hasMany(User);
    }
}, {
    getByAttrs: function (attrs) {

        return this.forge(attrs).fetch();
    }
});



// Model for series
var Series = Bookshelf.Model.extend({
    /*
     * series.increments('id').notNullable().primary();
     * series.string('name').unique();
     * series.integer('episode_id').references('episodes.id');
     * series.text('possible_successors');
     * series.specificType('valid_options', 'text[]');
     * series.boolean('start').defaultTo(false);
     * series.boolean('end').defaultTo(false);
     * series.integer('cohort_id').references('cohorts.id');
     */

    tableName: 'series',

    users: function () {

        return this.hasMany(User);
    },

    cohort: function () {

        return this.hasOne(Cohort);
    },

    episodes: function () {

        return this.hasMany(Episode);
    },

    messages: function () {

        return this.hasMany(Message);
    },
    // translates decision blob against user data
    translateDecisions: function (user) {

        var userBlob = {};
        if (user) {
            userBlob = user.toJSON();
            userBlob.first_name = user.first_name;
            userBlob.last_name = user.last_name;
        }

        var newOptions = [];
        // handle interpolation of options with userBlob
        this.get('valid_options').forEach(function (option) {

            if (option.indexOf('{{') > -1) {
                option = S(option).template(userBlob).s;
                newOptions.push(option);
            } else {
                newOptions.push(option);
            }
        });
        return {
            validOptions: newOptions,
            seriesName: this.get('name')
        };
    }
}, {
    getByAttrs: function (attrs) {

        return this.forge(attrs).fetch({ withRelated: ['messages'] });
    }
});

// Model for episode
var Episode = Bookshelf.Model.extend({
    tableName: 'episodes',

    series: function () {

        return this.hasMany(Series);
    },

    users: function () {

        return this.hasMany(User);
    },

    getStartSeriesForCohort: function (cohortId, fallback) {

        var self = this;

        return this.series().query({ where: { start: true } }).fetch().then(function (startSeries) {

            if (startSeries.length === 1) {
                return startSeries.at(0);
            }

            var inCohort = startSeries.filter(function (series) {

                return series.get('cohort_id') === cohortId;
            });

            if (inCohort.length > 0) {
                return inCohort[0];
            }

            if (fallback !== true) {
                throw new Error('Cannot find start series for episode ' + self.id + ' in cohort ' + cohortId);
            }

            return startSeries.at(0);

        });
    },

    //Return the options and messages for a given series queried by attributes
    //i.e. {name: 'Foo'}
    //Optionally translate decisions with given user model
    getMessagesAndOptions: function (seriesData, user) {

        if (seriesData.name && seriesData.name.nextSeries) {
            seriesData.name = seriesData.name.nextSeries;
        }
        return this.related('series').query({ where: seriesData }).fetchOne({ withRelated: ['messages'] }).then(function (series) {

            var messages = series.related('messages');
            var options = series.translateDecisions(user);
            messages.comparator = 'id';
            messages.sort();
            return {
                messages: messages,
                options: options.validOptions
            };
        });
    },

    users: function () {

        return this.hasMany(User);
    }
}, {
    getByAttrs: function (attrs) {

        return this.forge(attrs).fetch({ withRelated: ['series', 'series.messages'] });
    },
    make: function (attrs) {

        return this.forge(attrs).save().then(function (newEpisode) {

            return newEpisode.fetch();
        });
    }
});

// Model for territory
var Territory = Bookshelf.Model.extend({
    tableName: 'territories',

    users: function () {

        return this.hasMany(User);
    }
});

// Model for episode-cohort relationship
var EpisodeCohort = Bookshelf.Model.extend({
    tableName: 'episodes_cohorts',

    cohorts: function () {

        return this.hasMany(Cohort);
    },
    episodes: function () {

        return this.hasMany(Episode);
    }
});

var ConferenceMessage = Bookshelf.Model.extend({
    tableName: 'conferencemessages'
});

// Collection for users
var Users = Bookshelf.Collection.extend({
    model: User
});

// Collection for history
var Histories = Bookshelf.Collection.extend({
    model: History
});

// Collection for series (plural)
var SeriesCollection = Bookshelf.Collection.extend({
    model: Series
});

// Collection for episodes
var Episodes = Bookshelf.Collection.extend({
    model: Episode
});

// Collection for messages
var Messages = Bookshelf.Collection.extend({
    model: Message
});

// Collection for cohorts
var Cohorts = Bookshelf.Collection.extend({
    model: Cohort
});

// Collection for territories
var Territories = Bookshelf.Collection.extend({
    model: Territory
});

// Collection for episode-cohorts collection
var EpisodesCohorts = Bookshelf.Collection.extend({
    model: EpisodeCohort
});

var NumberPools = Bookshelf.Collection.extend({
    model: NumberPool
});

var ConferenceMessages = Bookshelf.Collection.extend({
    model: ConferenceMessage
});

module.exports = {
    Bookshelf: Bookshelf,
    Cohort: Cohort,
    Cohorts: Cohorts,
    ConferenceMessage: ConferenceMessage,
    ConferenceMessages: ConferenceMessages,
    Episode: Episode,
    EpisodeCohort: EpisodeCohort,
    Episodes: Episodes,
    EpisodesCohorts: EpisodesCohorts,
    Histories: Histories,
    History: History,
    Message: Message,
    Messages: Messages,
    NumberPool: NumberPool,
    NumberPools: NumberPools,
    Series: Series,
    SeriesCollection: SeriesCollection,
    Territories: Territories,
    Territory: Territory,
    User: User,
    Users: Users
};
