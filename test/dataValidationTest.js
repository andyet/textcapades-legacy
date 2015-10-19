/*global describe, it*/
var chai = require('chai');
var expect = chai.expect;

var validate = require('../tropo/dataValidation').validate;

/*
File: dataValidationTest.js
Author: Heather Seaman

Test data validation methods

*/


describe('validation.js', function () {

    var yesNoOptions = ['y', 'n'];
    var testOptions = ['tree', 'thistle', 'grass'];
    var tests = [{
        // find an option from the list
        input: 'one',
        validOptions: ['one', 'two', 'three', 'four'],
        expectedBool: true,
        expectedInput: 'one'
    }, {
        // reject invalid option
        input: 'blarg',
        validOptions: ['left', 'right'],
        expectedBool: false,
        expectedInput: 'blarg'
    }, {
        // no options defined
        input: 'thing',
        validOptions: [''],
        expectedBool: true,
        expectedInput: 'thing'
    }, {
        // parses a keyword from the middle
        input: 'there is a tree i see',
        validOptions: testOptions,
        expectedBool: true,
        expectedInput: 'tree'
    }, {
        // parses a yes/no response
        input: 'sure I do',
        validOptions: yesNoOptions,
        expectedBool: true,
        expectedInput: 'y'
    }, {
        // rejects invalid option
        input: 'naw',
        validOptions: yesNoOptions,
        expectedBool: true,
        expectedInput: 'n'
    }, {
        input: 'Arthaus',
        validOptions: ['arthaus', 'writers\' bloc', 'state of play', 'tech republic'],
        expectedBool: true,
        expectedInput: 'arthaus'
    }, {
        input: 'I come from Writers\' Bloc',
        validOptions: ['arthaus', 'writers\' bloc', 'state of play', 'tech republic'],
        expectedBool: true,
        expectedInput: 'writers\' bloc'
    }, {
        input: 'No I don\'t',
        validOptions: yesNoOptions,
        expectedBool: true,
        expectedInput: 'n'
    }, {
        input: 'I come from wb',
        validOptions: ['arthaus', 'writers\' bloc', 'state of play', 'tech republic'],
        expectedBool: true,
        expectedInput: 'writers\' bloc'
    }, {
        input: 'Y',
        validOptions: ['y', 'n'],
        expectedBool: true,
        expectedInput: 'y'
    }, {
        input: 'Yes',
        validOptions: ['y', 'n'],
        expectedBool: true,
        expectedInput: 'y'
    }, {
        input: 'Yea',
        validOptions: ['y', 'n'],
        expectedBool: true,
        expectedInput: 'y'
    }, {
        input: 'my name is Heather',
        validOptions: ['heather', 'pirate', 'default'],
        expectedBool: true,
        expectedInput: 'heather'
    }, {
        input: 'you\'re a very, long input with punctuation!',
        validOptions: ['you\'re a very, long input with punctuation!'],
        expectedBool: true,
        expectedInput: 'you\'re a very, long input with punctuation!'
    }, {
        input: 'you\'re a very',
        validOptions: ['you\'re a very long input with puncutation!'],
        expectedBool: false,
        expectedInput: 'you\'re a very'
    }, {
        input: 'i',
        validOptions: ['cogito ergo sum'],
        expectedBool: false,
        expectedInput: 'i'
    }, {
        input: 'if you\'re so smart, maybe you should try to save the world without moses\' help, gloria. or are you unequal to the task?',
        validOptions: ['if you\'re so smart'],
        expectedBool: true,
        expectedInput: 'if you\'re so smart'
    }, {
        input: 'if you\'re so',
        validOptions: ['if you\'re so smart'],
        expectedBool: false,
        expectedInput: 'if you\'re so'
    }, {
        input: 'if you\'re so smart, maybe',
        validOptions: ['if you\'re so smart'],
        expectedBool: false,
        expectedInput: 'if you\'re so smart, maybe'
    }, {
        input: 'some string or something',
        validOptions: ['animal', 'crackers in my', 'soup', 'some string', 'default'],
        expectedBool: true,
        expectedInput: 'some string or something'
    }];

    tests.forEach(function (test) {

        it('returns the expected boolean for input ' + test.input, function () {

            return validate(test.input, test.validOptions).then(function (isValid) {

                var validBool = isValid.isValid;
                var validInput = isValid.validInput;
                expect(validBool).to.equal(test.expectedBool);
                expect(validInput).to.equal(test.expectedInput);
            });
        });
    });
});
