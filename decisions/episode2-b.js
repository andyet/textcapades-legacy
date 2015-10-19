module.exports = {
    alphaStartEp2b: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'yesFriends' };
            case 'n':
                return { nextSeries: 'noFriends' };
        }
    },
    yesFriends: function () {

        return { nextSeries: 'canYouHelp' };
    },
    noFriends: function () {

        return { nextSeries: 'canYouHelp' };
    },
    canYouHelp: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'yesHelp' };
            case 'n':
                return { nextSeries: 'endAlphaNoHelp' };
        }
    },
    yesHelp: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'foundMap' };
            case 'n':
                return { nextSeries: 'endAlphaNoMap' };
            case 'nudge':
                return { nextSeries: 'endAlphaLost' };
        }
    },
    foundMap: function (input) {

        switch (input) {
            case 'left':
                return { nextSeries: 'goLeft' };
            case 'right':
                return { nextSeries: 'goRight' };
            case 'behind':
                return { nextSeries: 'goBehind' };
        }
    },
    goLeft: function () {

        return { nextSeries: 'seeLibrary' };
    },
    goRight: function (input) {

        switch (input) {
            case 'left':
                return { nextSeries: 'goLeft' };
            case 'behind':
                return { nextSeries: 'goBehind' };
            case 'right':
                return { nextSeries: 'endAlphaEp2b' };
        }
    },
    goBehind: function (input) {

        switch (input) {
            case 'right':
                return { nextSeries: 'goToBloc' };
            case 'left':
                return { nextSeries: 'goHome' };
        }
    },
    seeLibrary: function () {

        return { nextSeries: 'meetTraveler' };
    },
    meetTraveler: function (input) {

        switch (input) {
            case 'truth':
                return { nextSeries: 'endBetaTruth' };
            case 'lie':
                return { nextSeries: 'endGammaLie' };
        }
    },
    goToBloc: function () {

        return { nextSeries: 'seeLibrary' };
    },
    goHome: function (input) {

        switch (input) {
            case 'wait':
                return { nextSeries: 'meetTraveler' };
            case 'hide':
                return { nextSeries: 'hide' };
        }
    },
    hide: function (input) {

        switch (input) {
            case 'home':
                return { nextSeries: 'endBetaHome' };
            case 'follow':
                return { nextSeries: 'endBetaFollow' };
        }
    },
    endAlphaNoHelp: function () {

        return { nextSeries: 'end', nextEpisode: 'episode3' };
    },
    endAlphaNoMap: function () {

        return { nextSeries: 'end', nextEpisode: 'episode3' };
    },
    endAlphaEp2b: function () {

        return { nextSeries: 'end', nextEpisode: 'episode3' };
    },
    endAlphaLost: function () {

        return { nextSeries: 'end', nextEpisode: 'episode3' };
    },
    endBetaTruth: function () {

        return { nextSeries: 'end', cohort: 'beta', nextEpisode: 'episode3' };
    },
    endBetaFollow: function () {

        return { nextSeries: 'end', cohort: 'beta', nextEpisode: 'episode3' };
    },
    endBetaHome: function () {

        return { nextSeries: 'end', cohort: 'beta', nextEpisode: 'episode3' };
    },
    endGammaLie: function () {

        return { nextSeries: 'end', cohort: 'gamma', nextEpisode: 'episode3' };
    }
};
