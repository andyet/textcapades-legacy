var logger = require('debug')('textcapade');

var validChars = [
    // Standard Latin Characters
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    //
    // // Numbers
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    //
    // // Punctuation
    '!', '#', ' ', '"', '%', '&', '\'', '(', ')', '*', ',', '.', '?',
    '+', '-', '/', ';', ':', '<', '=', '>', '¡', '¿', '_', '@',
    //
    // // Currency
    '$', '£', '¥', '\u00A4', // [UNTYPED] CURRENCY SIGN
    //
    // // Accented Characters
    'è', 'é', 'ù', 'ì', 'ò', 'Ç', 'Ø', 'ø', 'Æ', 'æ', 'ß', 'É', 'Å',
    'å', 'Ä', 'Ö', 'Ñ', 'Ü', '§', 'ä', 'ö', 'ñ', 'ü', 'à',
    //
    // // Greek Characters
    '\u0394', // GREEK CAPITAL LETTER DELTA
    '\u03A6', // GREEK CAPITAL LETTER PHI
    '\u0393', // GREEK CAPITAL LETTER GAMMA
    '\u039B', // GREEK CAPITAL LETTER LAMBDA
    '\u03A9', // GREEK CAPITAL LETTER OMEGA
    '\u03A0', // GREEK CAPITAL LETTER PI
    '\u03A8', // GREEK CAPITAL LETTER PSI
    '\u03A3', // GREEK CAPITAL LETTER SIGMA
    '\u0398', // GREEK CAPITAL LETTER OMEGA
    '\u039E', // GREEK CAPITAL LETTER XI
    //
    // // Other Miscellaneous Characters
    '\u001B', // ESCAPE
    '\n', // NEW LINE or LINE FEED
    '\r'  // CARRIAGE RETURN
];

var validCharMap = validChars.reduce(function (map, char) {

    map[char] = true;
    return map;
}, {});

var replaceMap = {
    '’': '\'',
    '‘': '\'',
    ']': '>',
    '[': '<',
    '“': '"',
    '”': '"',
    'à': 'a',
    'ê': 'e',
    '–': '-',
    '…': '...',
    //template only:!
    '{': '{',
    '}': '}'
};

module.exports.validate = function (msg) {

    var invalid = [];

    for (var i = 0, ii = msg.length; i < ii; i++) {
        if (!validCharMap[msg.charAt(i)]) {
            invalid.push(msg.charAt(i));
        }
    }

    return invalid;
};

module.exports.replaceInvalid = function (msg, assert) {

    var char;
    var result = '';

    for (var i = 0, ii = msg.length; i < ii; i++) {
        char = msg.charAt(i);

        if (validCharMap[char]) {
            result += char;
        } else if (replaceMap[char]) {
            result += replaceMap[char];
        } else {
            if (assert) {
                throw new Error('Unknown sms char: ' + char);
            } else {
                logger('Unknown sms char: %s', char);
            }
        }
    }

    return result;
};
