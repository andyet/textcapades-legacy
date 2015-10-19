var decisions = require('../../decisions');
var models = require('../models');
var logger = require('debug')('textcapade');
var _ = require('lodash');
var validate = require('../../tropo/dataValidation').validate;

module.exports = function getUserHistory (user, episode) {

    var userBlob = user.toJSON();
    userBlob.first_name = user.first_name;
    userBlob.last_name = user.last_name;

    var appendSeries = function (seriesName, history) {

        if (seriesName === 'end') {
            return history;
        }

        if (!history) {
            history = [];
        }

        if (typeof seriesName !== 'string') {
            throw new Error('must be string ' + JSON.stringify(seriesName));
        }

        var seriesPromise = models.Series.forge({ name: seriesName }).fetch({
            withRelated: ['messages']
        });

        return seriesPromise.then(function (series) {

            return series.related('messages').fetch().then(function (_messages) {

                _messages = _.sortBy(_messages.models, function (m) {

                    return m.get('series_seq');
                }).map(function (m) {

                    return {
                        type: 'sent',
                        series: series.get('name'),
                        message: m.toJSON()
                    };
                });

                var newHistory = history.concat(_messages);

                var decisionFunction = decisions[episode.get('title')][series.get('name')];
                var input = user.get('answer_blob')[series.get('name')];
                var decision;
                var decisionBlob = series.translateDecisions(user);

                if (input) {
                    return validate(input, decisionBlob.validOptions).then(function (validation) {

                        newHistory.push({
                            type: 'received',
                            message: {
                                raw: input,
                                isValid: validation.isValid,
                                validated: validation.validInput
                            }
                        });

                        if (validation.isValid) {
                            decision = decisionFunction(validation.validInput, userBlob);
                            logger('Append series ' + decision.nextSeries);
                            return appendSeries(decision.nextSeries, newHistory);
                        }

                        newHistory.push({
                            type: 'sent_error',
                            message: {
                                body: 'What? How about: ' + decisionBlob.validOptions.join(' / ')
                            }
                        });
                    });
                }

                decision = decisionFunction(null, userBlob);

                if (!decision) {
                    logger('No decision ' + series.get('name'));
                    return newHistory;
                }

                logger('Append series ' + decision.nextSeries);
                return appendSeries(decision.nextSeries, newHistory);
            });
        });
    };

    return episode.getStartSeriesForCohort(user.get('cohort_id')).then(function (series) {

        return appendSeries(series.get('name'));
    });
};
