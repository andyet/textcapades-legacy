var config = require('getconfig');
var fs = require('fs');
var logger = require('debug')('textcapade');

var generateEpisode = require('./server/utils/episodeGenerator');
var models = require('./server/models');

var storyDir = config.storyDir;
var episodeTitle = process.argv[2];
if (!episodeTitle) {
    console.log('Use: buildEpisode episodetitle');
    process.exit(0);
}
logger('Checking if episode %s already exists and has any users currently on it...', episodeTitle);
models.Episode.forge({ title: episodeTitle }).fetch({ withRelated: ['users', 'series', 'series.messages'] }).then(function (episode) {

    if (episode) {
        if (episode.related('users').length > 0) {
            logger('There are currently %s users on that episode, cannot build', episode.related('users').length);
            process.exit(0);
        }
        logger('removing episode %s including series and messages', episodeTitle);
        return episode.related('series').mapThen(function (series) {

            return series.related('messages').mapThen(function (message) {

                return message.destroy();
            }).then(function () {

                return series.destroy();
            });
        }).then(function () {

            return episode.destroy();
        });
    }
}).then(function () {

    logger('building episode %s', episodeTitle);
    generateEpisode(episodeTitle, storyDir).then(function () {

        logger('done');
        process.exit();
    }).catch(function (err) {

        logger('Could not build episode: %s', err.stack);
        process.exit();
    });
});
