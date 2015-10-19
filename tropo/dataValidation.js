var _ = require('lodash');
var Promise = require('bluebird');
var logger = require('debug')('textcapade');

var AFFIRMATIVE_WORDS = [
    //original list
    'yes', 'yeah', 'sure', 'yep', 'yup', 'ya', 'ok', 'aye', 'uh-huh', 'all right', 'very well', 'i think so',

    //from: http://www.thesaurus.com/browse/yes
    'affirmative', 'fine', 'good', 'okay', 'true', 'yea', 'all right', 'by all means', 'certainly',
    'definitely', 'gladly', 'of course', 'positively', 'precisely', 'sure thing', 'surely', 'undoubtedly',
    'unquestionably', 'very well', 'willingly', 'without fail'
];

var NEGATIVE_WORDS = [
    //original list
    'nope', 'no', 'never', 'naw', 'nay', 'nah',

    //from: http://www.thesaurus.com/browse/no
    'negative', 'nyet', 'absolutely not', 'no way', 'not at all'
];


// map of base options to array of synonyms. hardcoded for now. Should be editable in web portal eventually
var synonyms = {
    'y': AFFIRMATIVE_WORDS,
    'n': NEGATIVE_WORDS,
    'tech republic': ['tr', 't.r.', 'republic'],
    'state of play': ['state', 'play', 'sp', 's.p.'],
    'writers\' bloc': ['wb', 'bloc', 'w.b.'],
    'don\'t know': ['i don\'t know', 'i don’t know', 'don\'t know', 'don’t know'],
    'aidan spencer': ['aiden', 'spencer'],
    'tic-tac-toe': ['tic', 'tictactoe'],
    'global thermonuclear war': ['global', 'war'],
    'not to play': ['not play', 'quit', 'not', 'stop playing', 'stop'],
    'je pense donc ju suis': ['je pense', 'pense', 'je pense, donc ju suis','je pense, donc ju suis.', 'je pense, donc je suis', 'je pense, donc je suis.'],
    'cogito ergo sum': [
        'i think therefore i am',
        'i think therefore i am.',
        'i think, therefore i am',
        'i think, therefore i am.',
        'i think. therefore i am.'],
    'don\'t tell me what to do. you are not the boss of me.': [
        'don’t tell me what to do. you are not the boss of me.',
        'don\'t tell me what to do. you are not the boss of me.'],
    'if you\'re so smart': [
        'if you\'re so smart, maybe you should try to save the world without moses\' help, gloria. or are you unequal to the task?',
        'if you’re so smart, maybe you should try to save the world without moses’ help, gloria. or are you unequal to the task?'],
    'live': [
        'let her live',
        'let him live',
        'let them live',
        'let it live',
        'keep her alive',
        'keep him alive',
        'keep them alive',
        'keep it alive',
        'alive'],
    'die': [
        'let her die',
        'let him die',
        'let them die',
        'let it die',
        'dead'],
    'north': ['go north'],
    'south': ['go south'],
    'east': ['go east'],
    'west': ['go west'],
    'take toothpaste': ['toothpaste'],
    'take elixir': ['take health elixir', 'elixir', 'health elixir'],
    'use dagger': ['dagger', 'happy dagger', 'use happy dagger'],
    'use elixir': ['elixir', 'use health elixir', 'health elixir'],
    'shower': ['examine shower'],
    'toilet': ['examine toilet'],
    'cabinet': ['examine cabinet', 'medicine cabinet', 'examine medicine cabinet'],
    'take off': ['take armor off', 'take off armor', 'armor off', 'off'],
    'leave on': ['leave armor on', 'leave on armor', 'armor on', 'on'],
    'get gold': ['get that gold', 'gold'],
    'get out': ['get the dang out of here', 'out'],
    'stand up': ['stand'],
    'look around': ['look'],
    'take a nap': ['take nap', 'nap'],
    'gold': ['get the gold', 'get gold'],
    'sneak': ['sneak the dang out', 'sneak out', 'sneak past', 'sneak past him'],
    'death': ['succumb to the sweet release of death'],
    'warn': ['warn him'],
    'go': ['just go'],
    'flag': ['flag him down'],
    'gate': ['front gate'],
    'northern': ['northern approach'],
    'clotho': ['theta', 'theta (clotho)'],
    'atropos': ['zeta', 'zeta (atropos)'],
    'talk to her': ['talk'],
    'get her out': ['out'],
    'grab her': ['grab'],
    'run': ['just run'],
    'fence': ['jump the fence', 'jump'],
    'ride': ['catch a ride'],
    'use dagger': ['use knife']
};


/*
 * search input against given options blob
 * input is cleaned for whitespace
 * input must match entire option exactly
 *
 * returns key of optionsblob if a match is found
 * otherwise returns input unchanged
 */
var searchInput = function (input, optionsBlob) {

    var resolved = input; //By default we return untranslated
    var inputSplit = input.toLowerCase().split(/\s+/);
    var inputClean = inputSplit.join(' ');
    var optionKeys = Object.keys(optionsBlob);
    Object.keys(optionsBlob).forEach(function (converted) {

        var optionsArray = optionsBlob[converted];
        optionsArray.forEach(function (validOption) {

            var searchTerm = validOption.toLowerCase();
            //If our entire input matches, we're good
            if (inputClean === searchTerm) {
                resolved = converted;
            }
            inputSplit.forEach(function (inputWord) {

                if (inputWord === searchTerm) {
                    resolved = converted;
                }
            });
        });
    });
    return new Promise(function (resolve) {

        return resolve(resolved);
    });
};

/*
 *
 * Input:
 * - validOptions: an array of options
 *
 * Returns: A JSON structured as { y: ['yes', 'yeah', 'y'],
 * n: ['no', 'nope', 'n']}
 * which keeps track of synonyms that the app recognizes
 *
 * If there are synonyms already existing we add the baseOptions to the array
 * If no synonyms exist we simply add the baseOption to the array as its own synonym
 */

var getOptionsBlob = function (validOptions) {

    var baseOptionsBlob = {};
    // a flat array to keep track of all options
    var allOptions = validOptions;
    // find synonyms and concat to array
    validOptions.forEach(function (baseOption) {

        // get all synonyms
        var aliasArray = synonyms[baseOption];
        // set value of baseOption as the aliasArray
        if (aliasArray) {
            aliasArray.push(baseOption);
            baseOptionsBlob[baseOption] = aliasArray;
            allOptions = allOptions.concat(aliasArray);
        } else {
            var singleOption = [baseOption];
            baseOptionsBlob[baseOption] = singleOption;
            allOptions.push(baseOption);
        }
    });
    return {
        baseOptionsBlob: baseOptionsBlob,
        allOptions: allOptions
    };
};


/*
Input:
- baseOptionsBlob: a JSON with base opts as keys, and arrays of synonyms at values

Returns: A JSON containing
- the same baseOptionsBlob with single char options removed
*/
var removeSingleCharOpts = function (baseOptionsBlob) {

    // remove single char options from the optionsBlob
    baseOptionsBlob = _.mapValues(baseOptionsBlob, function (optionArray) {

        var filteredOptions = optionArray;
        _.remove(filteredOptions, function (el) {

            return el.length === 1;
        });
        return filteredOptions;
    });
    return baseOptionsBlob;
};

/*
Input:
- input: the input string
- validOptions: an array of options

Returns: A JSON containing
- a boolean representing the validity of the input string
- the validated input

Checks the input against the array of validOptions
*/
var validateInput = function validateInput (input, validOptions) {

    //validOptions from the jade file, array of translated options
    var optionsParams = getOptionsBlob(validOptions);
    var baseOptionsBlob = optionsParams.baseOptionsBlob;
    var allOptions = optionsParams.allOptions;
    return searchInput(input, baseOptionsBlob).then(function (result) {

        var isValid = allOptions.indexOf(result) > -1 ? true : false;
        return {
            isValid: isValid,
            validInput: result
        };
    });
};

/*
 * Input:
 * - input: the input string
 * - validOptions: an array of options
 *
 * Returns: A JSON containing
 * - a boolean representing the validity of the input string
 * - the validated input
 *
 * Checks the input against the array validOptions
 */

var validate = function validate (input, validOptions) {

    var isValid = false;
    var validInput = input;
    // if no constraints on user input, validOptions is an array containing the empty string
    // or if no user input required, this is a fast-forward step
    if (!validOptions || validOptions[0].length === 0 || input === 'continue') {
        isValid = true;
        validInput = input;
    } else if (validOptions.indexOf('default') > -1) {
        // Remove the default option and force valid to true
        var defaultIndex = validOptions.indexOf('default');
        validOptions.splice(defaultIndex, 1);
        isValid = true;
        return validateInput(input, validOptions).then(function (validationResult) {

            validationResult.isValid = isValid;
            return validationResult;
        });
    } else if (validOptions[0].length > 0) {
        // There are valid options
        return validateInput(input, validOptions).then(function (validationResult) {

            return validationResult;
        });
    }
    // no valid options, return the original input
    return new Promise(function (resolve) {

        resolve({
            isValid: isValid,
            validInput: validInput
        });
    });
};

module.exports = {
    validate: validate
};
