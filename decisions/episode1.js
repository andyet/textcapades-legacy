module.exports = {
    alphaStartEp1: function () {

        return { nextSeries: 'connectionSuccess' };
    },
    connectionSuccess: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'comingThrough' };
            case 'n':
                return { nextSeries: 'notComingThrough' };
        }
    },
    notComingThrough: function () {

        return { nextSeries: 'terminalUnlock' };
    },
    comingThrough: function () {

        return { nextSeries: 'terminalUnlock' };
    },
    terminalUnlock: function (input) {

        switch (input) {
            case 'Terminal unlock: authorization M.Driver zero one.':
                return { nextSeries: 'correctSecure' };
            default:
                return { nextSeries: 'incorrectSecure' };
        }
    },
    correctSecure: function () {

        return { nextSeries: 'terminalSecure' };
    },
    incorrectSecure: function () {

        return { nextSeries: 'terminalSecure' };
    },
    terminalSecure: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'terminalIsSecure' };
            case 'n':
                return { nextSeries: 'terminalNotSecure' };
        }
    },
    terminalNotSecure: function () {

        return { nextSeries: 'askName' };
    },
    terminalIsSecure: function () {

        return { nextSeries: 'askName' };
    },
    askName: function (input, user) {

        input = input.toLowerCase();
        var name;
        var firstName;
        var rtcName;
        if (user.name) {
            name = user.name.toLowerCase();
        }
        if (user.first_name) {
            firstName = user.first_name.toLowerCase();
        }
        if (user.rtc_name) {
            rtcName = user.rtc_name.toLowerCase();
        }
        switch (input) {
            case name:
                return { nextSeries: 'realPreAskTerritory' };
            case firstName:
                return { nextSeries: 'realPreAskTerritory' };
            case rtcName:
                return { nextSeries: 'RTCPreAskTerritory' };
            default:
                return { nextSeries: 'smartassPreAskTerritory' };
        }
    },
    realPreAskTerritory: function () {

        return { nextSeries: 'askTerritory' };
    },
    RTCPreAskTerritory: function () {

        return { nextSeries: 'askTerritory' };
    },
    smartassPreAskTerritory: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'affirmPreAskTerritory' };
            case 'n':
                return { nextSeries: 'negativePreAskTerritory' };
        }
    },
    affirmPreAskTerritory: function () {

        return { nextSeries: 'askTerritory' };
    },
    negativePreAskTerritory: function () {

        return { nextSeries: 'askTerritory' };
    },
    askTerritory: function (input) {

        switch (input) {
            case 'tech republic':
                return { nextSeries: 'fromTechRepublic' };
            case 'state of play':
                return { nextSeries: 'fromStateOfPlay' };
            case 'writers\' bloc':
                return { nextSeries: 'fromWritersBloc' };
            case 'writers’ bloc':
                return { nextSeries: 'fromWritersBloc' };
            case 'arthaus':
                return { nextSeries: 'fromArthaus' };
        }
    },
    fromTechRepublic: function () {

        return { nextSeries: 'relief' };
    },
    fromStateOfPlay: function () {

        return { nextSeries: 'relief' };
    },
    fromWritersBloc: function () {

        return { nextSeries: 'relief' };
    },
    fromArthaus: function () {

        return { nextSeries: 'relief' };
    },
    relief: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'affirmPreWhoAmI' };
            case 'n':
                return { nextSeries: 'negPreWhoAmI' };
        }
    },
    affirmPreWhoAmI: function () {

        return { nextSeries: 'wonderWhoAmI' };
    },
    negPreWhoAmI: function () {

        return { nextSeries: 'wonderWhoAmI' };
    },
    wonderWhoAmI: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'affirmPreMad' };
            case 'n':
                return { nextSeries: 'negPreMad' };
        }
    },
    affirmPreMad: function () {

        return { nextSeries: 'areYouMad' };
    },
    negPreMad: function () {

        return { nextSeries: 'areYouMad' };
    },
    areYouMad: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'affirmPreHaveTime' };
            case 'n':
                return { nextSeries: 'negPreHaveTime' };
        }
    },
    affirmPreHaveTime: function () {

        return { nextSeries: 'haveTime' };
    },
    negPreHaveTime: function () {

        return { nextSeries: 'haveTime' };
    },
    haveTime: function () {

        return { nextSeries: 'register' };
    },
    register: function () {

        return { nextSeries: 'tellSILOS' };
    },
    tellSILOS: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'tellRichland' };
            case 'n':
                return { nextSeries: 'notTellRichland' };
        }
    },
    tellRichland: function () {

        return { nextSeries: 'heardALot' };
    },
    notTellRichland: function () {

        return { nextSeries: 'heardALot' };
    },
    heardALot: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'affirmHeardALot' };
            case 'n':
                return { nextSeries: 'negHeardALot' };
        }
    },
    affirmHeardALot: function () {

        return { nextSeries: 'seeName' };
    },
    negHeardALot: function () {

        return { nextSeries: 'seeName' };
    },
    seeName: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'affirmSeeName' };
            case 'n':
                return { nextSeries: 'negSeeName' };
        }
    },
    affirmSeeName: function () {

        return { nextSeries: 'preSpecArthaus' };

    },
    negSeeName: function () {

        return { nextSeries: 'preSpecArthaus' };
    },
    preSpecArthaus: function (response, user) {

        if (user.answer && user.answer.blob && user.answer_blob.askTerritory === 'arthaus') {
            return { nextSeries: 'specArthaus' };
        }
        return { nextSeries: 'willYouRebuild' };
    },
    specArthaus: function () {

        return { nextSeries: 'willYouRebuild' };
    },
    willYouRebuild: function (input) {

        switch (input) {
            case 'build':
                return { nextSeries: 'rebuild' };
            case 'burn':
                return { nextSeries: 'burn' };
        }
    },
    rebuild: function () {

        return { nextSeries: 'endAlphaEp1' };
    },
    burn: function () {

        return { nextSeries: 'endAlphaEp1' };
    },
    endAlphaEp1: function () {

        return { nextSeries: 'end', nextEpisode: 'episode2-a', cohort: 'alpha' };
    }
};
