// - THE ONE THAT COMES FROM CLOTHO ---------------------------- *

var logger = require('debug')('textcapade');

module.exports = {

    // - START ---------------------------- *

    allStartEp9a: function (response) {

        switch (response) {
            case 'y':
                return { nextSeries: 'yesTerminated' };
            case 'n':
                return { nextSeries: 'notTerminated' };
        }
    },

    // - SHARED ---------------------------- *

    yesTerminated: function () {

        return { nextSeries: 'yesTerminatedContinue' };
    },

    yesTerminatedContinue: function (response) {

        switch (response) {
            case 'harcourt':
                return { nextSeries: 'harcourt' };
            default:
                return { nextSeries: 'anotherPerson' };
        }
    },
    harcourt: function () {

        return { nextSeries: 'harcourtContinue' };
    },
    harcourtContinue: function (response) {

        switch (response) {
            case 'y':
                return { nextSeries: 'yesStorm' };
            case 'n':
                return { nextSeries: 'noDontStorm' };
        }
    },
    noDontStorm: function () {

        return { nextSeries: 'endEp9a' };
    },
    yesStorm: function () {

        return { nextSeries: 'endEp9a' };
    },
    anotherPerson: function () {

        return { nextSeries: 'harcourtContinue' };
    },
    notTerminated: function () {

        return { nextSeries: 'yesTerminatedContinue' };
    },

    // - ENDINGS ---------------------------- *

    endEp9a: function () {

        return { nextSeries: 'end' };
    }

};
