var S = require('string');
var fs = require('fs');
var path = require('path');
var models = require('../models');
var Promise = require('bluebird');

var parseTemplate = require('./parseTemplate').parseTemplate;

// to map episodes to character, also editable in website
var characterMap = {
    'episode0': 'atropos',
    'episode1': 'lachesis',
    'episode2-a': 'lachesis',
    'episode2-b': 'lachesis',
    'episode3': 'lachesis',
    'episode4': 'atropos',
    'episode5': 'lachesis',
    'episode6': 'clotho',
    'episode7': 'lachesis',
    'episode8-a': 'clotho',
    'episode8-b': 'atropos',
    'episode9-a': 'clotho',
    'episode9-b': 'atropos'
};

var getMessageData = function getMessageData (filename, storyDir) {

    filename = storyDir + filename;
    var template = parseTemplate(filename, storyDir);
    if (template) {
        var messages = template.messages;
        var validOptions = template.validOptions.split(',').map(function (option) {

            return option.trim();
        });
        var templateData = {
            messages: messages,
            validOptions: validOptions
        };
        return templateData;
    }
    throw new Error('Template ' + filename + ' does not exist!');

};

/*
Input:
- string: seriesName
- string: episodeDir: for finding the directory for jade files
- string: episodeTitle

Returns: A promise resolving when everything is done

Sets start/end based on seriesName
Sets the cohort for the series based on seriesName
Generates message model for all the message received from the parsed template
Saves the Series model

*/

//XXX
//Cohort on a series is for when there are multiple series I think? Cohort of current user.cohort_id? --Gar
//Need to figure this out

var generateSeries = function generateSeries (seriesName, episodeDir, episode) {

    var messageData = getMessageData(seriesName, episodeDir);
    var start = false;
    var end = false;
    var cohortArray;
    var cohortName;
    // set the start and end booleans based on the title of the template
    cohortArray = S(seriesName).humanize().s.split(' ');
    var startIndex = cohortArray.indexOf('start');
    var endIndex = cohortArray.indexOf('End');
    // naming convention is 'alphaStart' where Start is capitalized
    // and is the second word in camelCase
    // 'endGammaLost' where end is lower case and first word in camelCase
    if (startIndex > -1) {
        // the series is a starting template
        start = true;
        cohortName = cohortArray[0].toLowerCase();
    }
    if (endIndex > -1) {
        // the series is an ending template
        end = true;
        cohortName = cohortArray[1].toLowerCase();
    }

    return models.Cohort.getByAttrs({ name: cohortName }).then(function (cohort) {

        var seriesData = {
            name: seriesName,
            valid_options: messageData.validOptions,
            start: start,
            end: end
        };
        if (cohort) {
            seriesData.cohort_id = cohort.get('id');
        }
        return episode.related('series').create(seriesData).then(function (series) {

            return Promise.all(
                messageData.messages.map(function (content, index) {

                    return series.related('messages').create({
                        content: content.message,
                        wait: content.wait,
                        series_seq: index
                    });
                })
            );
        });
    });
};

/*
Input:
- episodeTitle
- storyDir: for finding the correct directory for jade files

Returns: A promise resolving when everything's done

*/
module.exports = function generateEpisode (episodeTitle, storyDir) {

    var episodeDir = storyDir + episodeTitle + '/';
    var episodeModel;
    var character = characterMap[episodeTitle];
    if (!character) {
        throw Error('Invalid episode title ' + episodeTitle);
    }
    var episodeFiles = fs.readdirSync(episodeDir);
    return models.Episode.make({ title: episodeTitle, from_character: character }, true).then(function (episode) {

        episodeModel = episode;
        return episodeFiles;
    }).each(function (file) {

        var seriesStat = fs.statSync(path.join(episodeDir, file));
        if (seriesStat.isFile()) {
            var seriesName = S(file).chompRight('.jade').s;
            return generateSeries(seriesName, episodeDir, episodeModel);
        }
    });
};
