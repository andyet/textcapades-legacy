/*global it, describe, before */
/*jshint -W030 */

var chai = require('chai');
var expect = chai.expect;
var config = require('getconfig');
var knex = require('knex')(config.db);

var receive = require('../messaging/receive');
var models = require('../messaging/accessModels');
var arrayEqual = require('../messaging/utils/arrayUtils').arrayEqual;

/*
File: receiveTest.js
Author: Heather Seaman

Tests for receipt of messages

*/

describe('receive.receive()', function () {

    // clear database after testing receive to get rid of garbage data
    before(function (done) {

        knex('history').del().then(function () {

            return knex('users').del();
        }).then(function () {

            done();
        });
    });

    //var storyDir = config.storyDir + 'episode1/';

    var tests = [{
        // receive valid input and determine the next template correctly
        input: 'yes',
        userBlob: {
            phone: 'receiveUser5',
            decisionBlob: {
                episodeTitle: 'decisionTest',
                seriesName: 'alphaStart',
                validOptions: ['y', 'n']
            },
            next_series_name: 'alphaStart'
        },
        expectedFile: 'connectionSuccess',
        expectedDecisionBlob: {
            episodeTitle: 'decisionTest',
            seriesName: 'connectionSuccess',
            validOptions: ['y', 'n']
        }
    }, {
        input: 'foo',
        userBlob: {
            phone: 'receiveUser6',
            decisionBlob: {
                episodeTitle: 'decisionTest',
                seriesName: 'alphaStart',
                validOptions: ['y', 'n']
            },
            next_series_name: 'alphaStart'
        },
        expectedFile: 'alphaStart',
        expectedDecisionBlob: {
            episodeTitle: 'decisionTest',
            seriesName: 'alphaStart',
            validOptions: ['y', 'n']
        }
    }, {
        input: 'Heather',
        userBlob: {
            name: 'heather',
            rtc_name: 'preethna',
            phone: 'receiveUser7',
            next_series_name: 'askName'
        },
        expectedFile: 'realPreAskTerritory',
        expectedDecisionBlob: {
            episodeTitle: 'decisionTest',
            seriesName: 'realPreAskTerritory',
            validOptions: ['continue']
        }
    }];

    tests.forEach(function (test) {

        it('file and decision data is saved correctly based on input ' + test.input, function (done) {

            // seed user based on email
            models.getUser(test.userBlob).then(function () {
                // receive input as user
                receive.receive(test.input, test.userBlob.phone).then(function (user) {

                    var nextFile = user.get('next_series_name');
                    var decisionBlob = user.get('decision_blob');
                    expect(test.expectedFile).to.equal(nextFile);
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
