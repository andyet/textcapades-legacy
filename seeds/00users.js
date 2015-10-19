var uuid = require('uuid');
var log = require('debug')('textcapade');

var getEpisode = function getEpisode (episodes, episodeTitle) {

    var found;
    episodes.forEach(function (episode) {

        if (episode.title === episodeTitle) {
            found = episode;
        }
    });
    return found;
};

exports.seed = function (knex, Promise) {

    return Promise.resolve().then(function () {

        return Promise.all([

            //These will take a little bit of foreknowledge but the ordering will keep things consistent
            //each time you run it
            knex('cohorts').orderBy('name'),
            knex('territories').orderBy('name'),
            knex('episodes').orderBy('title'),
            knex('series').where({ name: 'everythingIsFine' })
            //knex('series').where({ start: true }).orderBy('episode_id', 'id')
        ]).then(function (results) {

            var cohorts = results[0];
            var territories = results[1];
            var episodes = results[2];
            var fineSeries = results[3];

            var users = [];
            var episode1 = getEpisode(episodes, 'episode1');
            var episode2a = getEpisode(episodes, 'episode2-a');
            var episode2b = getEpisode(episodes, 'episode2-b');
            var episode3 = getEpisode(episodes, 'episode3');

            if (episode1) {
                log('Adding episode1 users');
                users.push(knex('users').insert({
                    name: 'Terry episode 1',
                    phone: '',
                    email: 'terry@andyet.com',
                    answer_blob: {},
                    episode_id: episode1.id,
                    validate_key: uuid.v4()
                }));
                users.push(knex('users').insert({
                    name: 'Adam episode 1',
                    phone: '',
                    email: 'adam@andyet.com',
                    answer_blob: {},
                    episode_id: episode1.id,
                    validate_key: uuid.v4()
                }));
            }
            if (episode2a) {
                log('Adding episode2a users');
                users.push(knex('users').insert({
                    name: 'Terry episode 2-a alpha arthaus',
                    phone: '',
                    email: 'terry@andyet.com',
                    answer_blob: { 'askTerritory':'arthaus' },
                    episode_id: episode2a.id,
                    cohort_id: cohorts[0].id,
                    validate_key: uuid.v4()
                }));
            }
            if (episode3) {
                log('Adding episode3 users');
                users.push(
                knex('users').insert({
                    name: 'Gar episode 3 beta arthaus',
                    phone: '',
                    email: 'terry@andyet.com',
                    answer_blob: { 'askTerritory':'arthaus' },
                    next_series_id: fineSeries.id,
                    episode_id: episode3.id,
                    cohort_id: cohorts[1].id,
                    validate_key: uuid.v4()
                }));
            }

            return Promise.all(users);
        });
    });
};
