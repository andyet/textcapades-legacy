/*global it, describe */
/*jshint -W030 */

var chai = require('chai');
var expect = chai.expect;
var config = require('getconfig');

var getMessageData = require('../messaging/utils/getMessageData');
var arrayEqual = require('../messaging/utils/arrayUtils').arrayEqual;


/*
File: getMessageDataTest.js
Author: Heather Seaman

Tests for correct parsing of templates into JSON

*/

describe('getMessageData.getMessageData', function () {

    //var user = {
    //name: 'Test User',
    //email: 'testuser@andyet.com'
    //};

    var storyDir = config.storyDir + 'episode1/';

    var tests = [
        // {
        // 	filename: 'hallway',
        // 	expectedMsgCount: 4,
        // 	expectedValidOptions: [ 'door', 'sound' ],
        // },
        // {
        // 	filename: 'door',
        // 	expectedMsgCount: 6,
        // 	expectedValidOptions: [ 'through', 'wait'],
        // },
        // {
        // 	filename: 'sound',
        // 	expectedMsgCount: 3,
        // 	expectedValidOptions: ['investigate', 'pounding'],
        // },
        // {
        // 	filename: 'end',
        // 	expectedMsgCount: 3,
        // 	expectedValidOptions: ['default'],
        // },

    ];

    tests.forEach(function (test) {

        var result = getMessageData(test.filename, storyDir);
        it('gets the correct number of messages in ' + test.filename, function () {

            expect(result.messages.length).to.equal(test.expectedMsgCount);
        });
        it('gets the correct validOptions for ' + test.filename, function () {

            var isEqual = arrayEqual(result.validOptions, test.expectedValidOptions);
            expect(isEqual).to.be.true;
        });

    });
});
