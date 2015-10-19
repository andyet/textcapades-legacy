var axios = require('axios');
var logger = require('debug')('textcapade');
var qs = require('qs');
var config = require('getconfig');
var _ = require('lodash');
var S = require('string');
var Url = require('url');
var models = require('../server/models');


exports.sendMessage = function (msgData) {

    var fromPhone = msgData.from;
    var userPhone = msgData.to;
    var message = msgData.message;

    var cleanup = function (urlString, replacement, pattern) {

        return S(urlString).replaceAll(pattern, replacement).s;
    };


    var messageString = qs.stringify({
        token: config.tropoToken,
        from: fromPhone,
        msg: message,
        myNumbers: userPhone
    });

    // make request to Tropo to send message
    var urlString = config.tropo.apiUrl + '/sessions?action=create&' + messageString;
    // replace url encoding %E2%80%99 with %27 to fix
    // also need to handle other special chars here

    urlString = _.reduce({
        '%E2%80%99': '%27',
        '%E2%80%A6': '%2E%2E%2E'
    }, cleanup, urlString);

    logger('tropo request %s', urlString);

    if (config.tropo.isDummy || process.env.NODE_ENV === 'production') {
        return axios.get(urlString).then(function (response) {

            if (response.status >= 400) {
                throw new Error('BadRequest: ' + response.status + ' ' + response.data);
            }
            logger('tropo response %j', response);
            return response;
        });
    }
};

exports.provisionNumbers = function (prefix) {

    var url = Url.parse(config.tropo.apiUrl);
    if (url.pathname.charAt(url.pathname.length - 1) !== '/') {
        url.pathname += '/';
    }
    url.pathname += 'applications/' + config.tropo.appId + '/addresses';
    var opts = { headers: {} };
    opts.headers.authorization = 'Basic ' + new Buffer(config.tropo.username + ':' + config.tropo.password).toString('base64');

    var numbers = [];
    var getNumber = function () {

        var payload = {
            type: 'number'
        };

        if (prefix) {
            payload.prefix = prefix;
        }

        return axios.post(Url.format(url), payload, opts).then(function (response) {

            numbers.push(response.data.href.slice(response.data.href.indexOf('+') + 1));
            return;
        });
    };

    if (config.tropo.isDummy || process.env.NODE_ENV === 'production') {
        return getNumber().then(getNumber).then(getNumber).then(function () {

            return numbers;
        });
    }
};

exports.removeNumber = function (number) {

    var url = Url.parse(config.tropo.apiUrl);
    if (url.pathname.charAt(url.pathname.length - 1) !== '/') {
        url.pathname += '/';
    }
    url.pathname += 'applications/' + config.tropo.appId + '/addresses/number/' + number;
    var opts = { headers: {} };
    opts.headers.authorization = 'Basic ' + new Buffer(config.tropo.username + ':' + config.tropo.password).toString('base64');

    if (config.tropo.isDummy || process.env.NODE_ENV === 'production') {
        return axios.delete(Url.format(url), opts);
    }
};
