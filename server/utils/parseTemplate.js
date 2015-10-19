var jade = require('jade');
var S = require('string');
var fs = require('fs');

/*
 * File: parseTemplate.js
 * Author: Heather Seaman
 *
 * Brief: Contains methods for parsing JADE and putting messages into
 * queue that can be delivered to the user. Also extracts meta data encoded
 * in the JADE template specifying the decisionFunction which determines the
 * next template to parse.
 *
 */

// does initial jade parse
var parseJade = function parseJade (filename ) {

    return jade.renderFile(filename);
};

/*
    Input:
      - filename: a string
      - storyDir: a directory to search for the template

    Returns: a JSON object containing data from the Jade

    Parses jade output to array of messages and wait times.
    Takes decisionFunction key from filename, no need to specify in template

*/
var parseTemplate = function parseTemplate (filename, storyDir) {
    // add extension for parsing
    var filepath = filename + '.jade';
    var exists = fs.existsSync(filepath);
    if (exists) {
        var html = parseJade(filepath);
        var messages = extractMessages(html);
        return {
            filename: filename,
            chapter: extractFromTag(html, 'chapter'),
            decisionFunction: S(filename).chompLeft(storyDir).s,
            validOptions: extractFromTag(html, 'validOptions'),
            messages: messages //array of {message: message, wait: wait}
        };
    }
    throw new Error('File ' + filepath + ' does not exist!!');
};

/*
 * Extracts all the messages and any optional wait times from the html
 *
 * Messages begin with <p>
 * Wait times precede the message they are intended for and begin with <wait>
 *
 * Example
 * <p> Message with no wait
 * <wait> 10
 * <p> Message with wait of 10
 * <wait> 20
 * <p> Message with wait of 20
 * <p> Message with no wait
*/

var extractMessages = function extractMessages (html) {

    var truncateIndex;
    var waitTag = 'wait';
    var waitClose = '</wait>';
    var messageTag = 'p';
    var messageClose = '</p>';
    var remainingString = S(html);
    var currentMessage = {};
    var results = []; //array of {message: message, wait: wait}
    while (remainingString.contains(messageClose)) {
        nextWait = remainingString.s.indexOf(waitClose);
        nextMessage = remainingString.s.indexOf(messageClose); //Guaranteed to exist thanks to while condition
        if (nextWait > -1 && nextWait < nextMessage) {
            //Assign it and remove it from remainingString
            currentMessage.wait = extractFromTag(remainingString.s, waitTag);
            truncateIndex = remainingString.s.indexOf(waitClose) + (waitClose.length);
            remainingString = S(remainingString.s.substr(truncateIndex));
        }
        currentMessage.message = extractFromTag(remainingString.s, messageTag);
        truncateIndex = remainingString.s.indexOf(messageClose) + (messageClose.length);
        remainingString = S(remainingString.s.substr(truncateIndex));
        results.push(currentMessage);
        currentMessage = {};
    };
    return results;
};


/*
    Input:
      - html: a string of html text
      - tag: a string

    Returns: a string

    Using string.js between() method to extract content
    between html tags

*/
var extractFromTag = function extractFromTag (html, tag) {

    var openTag = '<' + tag + '>';
    var closeTag = '</' + tag + '>';
    // See docs on between() method in string.js.
    // Only extract first encountered result so if duplicate
    //tags we have to handle these cases
    var extraction = S(html).between(openTag, closeTag);
    return extraction.s;
};


module.exports = {
    parseTemplate: parseTemplate,
    parseJade: parseJade,
    extractMessages: extractMessages,
    extractFromTag: extractFromTag
};
