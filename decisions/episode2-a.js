module.exports = {
    alphaStartEp2a: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'yesRemember' };
            case 'n':
                return { nextSeries: 'dontRemember' };
        }
    },
    yesRemember: function () {

        return { nextSeries: 'addressBook' };
    },
    dontRemember: function () {

        return { nextSeries: 'addressBook' };
    },
    addressBook: function () {

        return { nextSeries: 'hearCodename' };
    },
    hearCodename: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'yesHearCodename' };
            case 'n':
                return { nextSeries: 'noHearCodename' };
        }
    },
    yesHearCodename: function () {

        return { nextSeries: 'hearWhyName' };
    },
    noHearCodename: function () {

        return { nextSeries: 'hearWhyName' };
    },
    hearWhyName: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'moirai' };
            case 'n':
                return { nextSeries: 'noMoirai' };
        }
    },
    moirai: function (input) {

        switch (input) {
            case 'clotho':
                return { nextSeries: 'clotho' };
            case 'atropos':
                return { nextSeries: 'atropos' };
            case 'lachesis':
                return { nextSeries: 'lachesis' };
            case 'skip':
                return { nextSeries: 'endAlphaEp2a' };
            case 'all': {
                return { nextSeries: 'all' };
            }
        }
    },
    noMoirai: function () {

        return { nextSeries: 'endAlphaEp2a' };
    },
    clotho: function () {

        return { nextSeries: 'repeatMoirai' };
    },
    atropos: function () {

        return { nextSeries: 'repeatMoirai' };
    },
    lachesis: function () {

        return { nextSeries: 'repeatMoirai' };
    },
    repeatMoirai: function (input) {

        switch (input) {
            case 'clotho':
                return { nextSeries: 'clotho' };
            case 'atropos':
                return { nextSeries: 'atropos' };
            case 'lachesis':
                return { nextSeries: 'lachesis' };
            case 'skip':
                return { nextSeries: 'endAlphaEp2a' };
        }
    },
    all: function (input) {

        return { nextSeries: 'endAlphaEp2a' };
    },
    endAlphaEp2a: function () {

        return { nextSeries: 'end', cohort: 'alpha', nextEpisode: 'episode2-b' };
    }

};
