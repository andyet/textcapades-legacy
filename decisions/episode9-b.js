// - THE ONE THAT COMES FROM ATROPOS ---------------------------- *

var logger = require('debug')('textcapade');

module.exports = {

    // - START ---------------------------- *

    allStartEp9b: function (response) {

        switch (response) {
            case 'y':
                return { nextSeries: 'yesTerm' };
            case 'n':
                return { nextSeries: 'notTerm' };
        }
    },

    // - SHARED ---------------------------- *

    yesTerm: function () {

        return { nextSeries: 'yesTermContinue' };
    },
    yesTermContinue: function (response) {

        switch (response) {
            case 'y':
                return { nextSeries: 'yesReady' };
            case 'n':
                return { nextSeries: 'notReady' };
        }
    },
    yesReady: function () {

        return { nextSeries: 'endEp9b' };
    },
    notReady: function () {

        return { nextSeries: 'endEp9b' };
    },
    notTerm: function () {

        return { nextSeries: 'endEp9b' };
    },

    // - ENDING ---------------------------- *

    endEp9b: function () {

        return { nextSeries: 'end' };
    }

};