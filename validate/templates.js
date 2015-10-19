/*global it, describe */
/*jshint -W030 */
/*
 * This validates the actual templates in the story
 * So it's technically validation not testing
 */
var fs = require('fs');
var path = require('path');
var chai = require('chai');
var S = require('string');
var assert = chai.assert;
var expect = chai.expect;
var config = require('getconfig');
var allDecisions = require('../decisions/index');
var parseTemplate = require('../server/utils/parseTemplate');

var getTemplates = function getTemplates () {

    var storyDir = config.storyDir;
    var episodes = fs.readdirSync(storyDir);
    var seriesNames = [];
    var seriesFiles = [];
    episodes.forEach(function (episode) {

        var episodePath = path.resolve(path.join(storyDir, episode));
        var series = fs.readdirSync(episodePath);
        series.forEach(function (name) {

            var seriesPath = path.resolve(path.join(episodePath, name));
            var seriesStat = fs.statSync(seriesPath);
            //Ignore includes
            if (seriesStat.isFile()) {
                seriesNames.push(S(name).chompRight('.jade').s);
                seriesFiles.push(seriesPath);
            }
        });
    });
    return {
        names: seriesNames,
        files: seriesFiles
    };
};
// Validate the Jade Templates for correctness
describe('validateJadeTemplates', function () {

    //TODO this userneeds to have a name length equal to our predetermined max name length
    var testUser = {
        name: 'Joseph Test User McGillicutty',
        decision_blob: {
            chapter: './decisions/decisionTest',
            decisionFunction: 'testFunction',
            validOptions: [
                'Y',
                'N'
            ]
        }
    };
    var templates = getTemplates();
    var seriesNames = templates.names;
    seriesNames.forEach(function (seriesName, index) {

        it('duplicate files between ' + seriesName + ' and ' + seriesNames[index + 1], function () {

            expect(seriesName === seriesNames[index + 1]).to.be.false;
        });
    });
    var episodeKeys = Object.keys(allDecisions);
    var allSeriesDecisions = [];
    episodeKeys.forEach(function (episodeKey) {

        var episodeDecisions = allDecisions[episodeKey];
        var seriesKeys = Object.keys(episodeDecisions);
        seriesKeys.forEach(function (seriesKey) {

            allSeriesDecisions.push(seriesKey);
            it(seriesKey + ' from ' + episodeKey + ' has a corresponding jade template', function () {

                assert.include(seriesNames, seriesKey);
            });
        });
    });
    seriesNames.forEach(function (seriesName) {

        it(seriesName + ' has a corresponding decision function', function () {

            assert.include(allSeriesDecisions, seriesName);
        });
    });
    templates.files.forEach(function (file) {

        var fileStat = fs.statSync(file);
        var fileString = fs.readFileSync(file).toString();
        var html = parseTemplate.parseJade(file, {
            user: testUser
        });
        // checks jade files for tabs
        var containsTab = S(fileString).contains('\t');
        //checks for chapter, decisionFunction, validOptions
        var validOptionsCount = S(fileString).count('\nvalidOptions');
        var validOptionsContent = parseTemplate.extractFromTag(html, 'validOptions');
        var messageContents = parseTemplate.extractMessages(html);
        messageContents.forEach(function (message) {

            it(file + ' has all messages under 160 chars', function () {

                expect(message.message).to.have.length.below(160);
            });
            it(file + ' does not contain jade interpolation', function () {

                expect(message.message).not.to.contain('#{');
            });
        });

        it(file + ' is valid', function () {

            // has no tabs
            expect(containsTab).to.be.false;
            // expect(decisionFunctionCount).to.equal(1);
            expect(validOptionsCount).to.equal(1);
            // has content for the validOptions tag
            expect(validOptionsContent).not.to.be.empty;
            // answers should be normalized to lower case
            expect(S(validOptionsContent).isUpper()).to.be.false;
        });
    });
});
