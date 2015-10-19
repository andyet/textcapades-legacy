/*global it, describe, before */
/*jshint -W030 */
var chai = require('chai');
var expect = chai.expect;
var config = require('getconfig');
var knex = require('knex')(config.db);
var models = require('../messaging/accessModels');
var send = require('../messaging/send');
var arrayEqual = require('../messaging/utils/arrayUtils').arrayEqual;
chai.config.includeStack = true;
// turn on stack trace
/*
File: sendTest.js
Author: Heather Seaman

Test send methods

 */


describe('send.resolveUser', function () {

    // clear database before testing
    before(function (done) {

        knex('history').del().then(function () {

            return knex('users').del();
        }).then(function () {

            done();
        });
    });
    var tests = [
        // create new user, do not set template
        {
            phone: '2',
            isStarting: true,
            nextSeries: undefined,
            expectedTemplate: 'alphaStart',
            expectedDecisionBlob: {
                episodeTitle: 'decisionTest',
                seriesName: 'alphaStart',
                validOptions: [
                    'y',
                    'n'
                ]
            }
        },
        // look up existing user, do not set template
        {
            phone: '2',
            isStarting: false,
            nextSeries: undefined,
            expectedTemplate: 'alphaStart',
            expectedDecisionBlob: {
                episodeTitle: 'decisionTest',
                seriesName: 'alphaStart',
                validOptions: [
                    'y',
                    'n'
                ]
            }
        }
    ];
    tests.forEach(function (test) {

        it('the next template ' + test.template + ' is saved correctly', function (done) {

            // seed user based on phone
            models.getUser({
                phone: test.phone
            }).then(function () {

                // receive input as user
                send.resolveUser(test.phone, test.isStarting, test.nextSeries).then(function (user) {

                    var nextFile = user.get('next_series_name');
                    var decisionBlob = user.get('decision_blob');
                    expect(test.expectedTemplate).to.equal(nextFile);
                    expect(test.expectedDecisionBlob.episodeTitle).to.equal(decisionBlob.episodeTitle);
                    expect(test.expectedDecisionBlob.seriesName).to.equal(decisionBlob.seriesName);
                    var arraysAreEqual = arrayEqual(test.expectedDecisionBlob.validOptions, decisionBlob.validOptions);
                    expect(arraysAreEqual).to.be.true;
                    done();
                });
            });
        });
    });
});
