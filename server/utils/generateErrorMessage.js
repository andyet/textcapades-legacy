var _ = require('lodash');

module.exports = function generateErrorMessage (validOptions) {

    if (validOptions.length === 2 && _.contains(validOptions, 'y') && _.contains(validOptions, 'n')) {

        return 'I\'m just looking for a simple yes or no here. ;) <?>';
    }

    validOptions = _.uniq(validOptions);

    return [
        'Just tell me straight up: ',
        _.initial(validOptions).join(', ') + ' or ' + _.last(validOptions),
        '. <?>'
    ].join('');
};
