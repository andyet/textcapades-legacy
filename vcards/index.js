var Fs = require('fs');
var Path = require('path');

var internals = {
    lachesis: Fs.readFileSync(Path.join(__dirname, 'l.vcf'), 'utf8'),
    clotho: Fs.readFileSync(Path.join(__dirname, 'c.vcf'), 'utf8'),
    atropos: Fs.readFileSync(Path.join(__dirname, 'a.vcf'), 'utf8')
};

exports.generate = function (pool) {

    var encode = function (card, num) {

        var tempCard = card.replace('9999999999', '+' + num);
        return {
            content_type: 'application/octet-stream',
            content: new Buffer(tempCard).toString('base64')
        };
    };

    return {
        'l.vcf': encode(internals.lachesis, pool.get('lachesis')),
        'c.vcf': encode(internals.clotho, pool.get('clotho')),
        'a.vcf': encode(internals.atropos, pool.get('atropos'))
    };
};
