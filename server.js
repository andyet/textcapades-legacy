var Config = require('getconfig');
var Hapi = require('hapi');
var Joi = require('joi');
var jade = require('jade');
var routes = require('./server/routes');
var Hoek = require('hoek');

//Start up the sms sending worker
var tropoWorker = require('./tropo/worker');

//Start up the slack sending worker
var slackWorker = require('./slack/worker');

var server = new Hapi.Server();

server.connection({
    host: 'localhost',
    port: Config.port
});
var plugins = [{
    register: require('good'),
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {
                log: '*',
                response: '*',
                error: '*',
                request: '*'
            }
        }]
    }
}];

server.state('message', { encoding: 'base64', path: '/' });

server.views({
    isCached: false,
    engines: { jade: jade },
    path: __dirname + '/templates'
});

server.route(routes);
server.route({
    method: 'GET',
    path: '/moderator/setinterval',
    handler: function (request, reply) {

        tropoWorker.INTERVAL = request.query.interval;
        reply('interval set to ' + worker.INTERVAL);
    },
    config: {
        validate: {
            query: {
                interval: Joi.number().integer().required()
            }
        }
    }
});

server.register(plugins, function (err) {

    Hoek.assert(!err, 'Failed loading plugins: ' + err);
    server.start(function (err) {

        Hoek.assert(!err, 'Failed starting server: ' + err);

        server.log('Server running at:', server.info.uri);
    });
});
