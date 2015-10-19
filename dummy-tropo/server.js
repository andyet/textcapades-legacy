var Config = require('getconfig');
var Hapi = require('hapi');
var Axios = require('axios');
var logger = require('debug')('textcapade');
var config = require('getconfig');

var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

var server = new Hapi.Server();

server.connection({
    host: 'localhost',
    port: 8999
});

var NUMBER;

server.route({
    method: 'get',
    path: '/sessions',
    handler: function (request, reply) {

        NUMBER = request.query.from;
        logger('<%s:%s', request.query.from, request.query.msg);
        reply('OK');
    }
});

server.route({
    method: 'post',
    path: '/applications/' + Config.tropo.appId + '/addresses',
    handler: function (request, reply) {

        var nums = '0123456789';
        var phone = '';
        for (var i = 0; i < 7; ++i) {
            phone += nums.charAt(Math.floor(Math.random() * nums.length));
        }

        reply({ href: config.tropo.apiUrl + '/applications/' + Config.tropo.appId + '/addresses/number/+' + request.payload.prefix + phone });
    }
});

server.route({
    method: 'delete',
    path: '/applications/' + Config.tropo.appId + '/addresses/number/{phone}',
    handler: function (request, reply) {

        reply({ message: 'delete successful' });
    }
});

var sendMessage = function (message) {

    var data = {
        from: config.dummyUserPhone,
        msg: message,
        to: NUMBER
    };

    Axios.post('http://localhost:8000/tropo/callback', data).then(function () {

        logger('> Sent');
    }).catch(function (err) {

        logger('Error %j', err);
    });
};

server.start(function () {

    console.log('Dummy Tropo server running at:', server.info.uri);
});

rl.on('line', function (line){

    sendMessage(line.trim());
});
