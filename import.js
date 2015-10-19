var fs = require('fs');
var models = require('./server/models');
var Promise = require('bluebird');
var csvParse = require('csv-parse');

fs.createReadStream(process.argv[2]).pipe(csvParse({ delimiter: ',', columns: true }, function (err, users) {

    if (err) {
        throw err;
    }

    console.log('attempting to import %d users', users.length);

    models.Episode.forge({ title: 'episode1' }).fetch().then(function (episode) {

        return models.Series.forge({ episode_id: episode.id, start: true }).fetch()
        .then(function (series) {

            return Promise.resolve(users)
            .each(function (user) {

                console.log('importing user', user.name);
                user.episode_id = episode.id;
                user.next_series_id = series.id;
                return models.User.forge(user).save();
            })
            .then(function () {

                console.log('finished importing %d users', users.length);
                process.exit();
            })
            .catch(function (err) {

                console.log('got an error!', err);
            });
        });
    });
}));
