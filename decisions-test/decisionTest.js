module.exports = {
    alphaStart: function () {

        return 'connectionSuccess';
    },
    connectionSuccess: function (input) {

        switch (input) {
            case 'y':
                return 'comingThrough';
            case 'n':
                return 'notComingThrough';
        }
    },
    notComingThrough: function () {

        return 'terminalUnlock';
    },
    comingThrough: function () {

        return 'terminalUnlock';
    },
    terminalUnlock: function (input) {

        switch (input) {
            case 'Terminal unlock: authorization M.Driver zero one.':
                return 'correctSecure';
            default:
                return 'incorrectSecure';
        }
    },
    correctSecure: function () {

        return 'terminalSecure';
    },
    incorrectSecure: function () {

        return 'terminalSecure';
    },
    askName: function (input, user) {

        input = input.toLowerCase();
        var name;
        var rtcName;
        if (user.name) {
            name = user.name.toLowerCase();
        }
        if (user.rtc_name) {
            rtcName = user.rtc_name.toLowerCase();
        }
        switch (input) {
            case name:
                return 'realPreAskTerritory';
            case rtcName:
                return 'RTCPreAskTerritory';
            default:
                return 'smartassPreAskTerritory';
        }
    },
    realPreAskTerritory: function () {

        return 'askTerritory';
    },
    RTCPreAskTerritory: function () {

        return 'askTerritory';
    },
    smartassPreAskTerritory: function (input) {

        switch (input) {
            case 'y':
                return 'affirmPreAskTerritory';
            case 'n':
                return 'negativePreAskTerritory';
        }
    },
    seeName: function (input) {

        switch (input) {
            case 'y':
                return 'affirmSeeName';
            case 'n':
                return 'negSeeName';
        }
    },
    affirmSeeName: function () {

        return 'preSpecArthaus';

    },
    negSeeName: function () {

        return 'preSpecArthaus';
    },
    preSpecArthaus: function (user) {

        if (user.answer_blob.askTerritory === 'arthaus') {
            return 'specArthaus';
        }
        return 'willYouRebuild';
    },
    terminalIsSecure: function () {

        return 'askName';
    },
    specArthaus: function () {

        return 'willYouRebuild';
    },
    willYouRebuild: function (input) {

        switch (input) {
            case 'rebuild':
                return 'rebuild';
            case 'burn':
                return 'burn';
        }
    },
    affirmPreAskTerritory: function () {

        return 'askTerritory';
    },
    negativePreAskTerritory: function () {

        return 'askTerritory';
    },
    askTerritory: function (input) {

        switch (input) {
            case 'tech republic':
                return 'techRepublic';
            case 'state of play':
                return 'stateOfPlay';
            case 'writers\' bloc':
                return 'fromWritersBloc';
            case 'writers’ bloc':
                return 'fromWritersBloc';
            case 'arthaus':
                return 'fromArthaus';
        }
    },
    techRepublic: function () {

        return 'relief';
    },
    stateOfPlay: function () {

        return 'relief';
    },
    fromWritersBloc: function () {

        return 'relief';
    },
    fromArthaus: function () {

        return 'relief';
    },
    relief: function (input) {

        switch (input) {
            case 'y':
                return 'affirmPreWhoAmI';
            case 'n':
                return 'negPreWhoAmI';
        }
    },
    hallway: function (input) {

        switch (input) {
            case 'door':
                return 'door';
            //case 'door':
                //return 'sound';
        }
    },
    sound: function (input) {

        switch (input) {
            case 'investigate':
                return 'shout';
            case 'door':
                return 'door-2';
        }
    },
    door: function (input) {

        switch (input) {
            case 'through':
                return 'giant';
            case 'wait':
                return 'spider';
        }
    },
    continueFile: function () {

        return 'continueNext';
    },
    continueNext: function () {

        return 'continueThird';
    },
    continueThird: function () {

        return 'door';
    },
    whatsYourIdea: function (input) {

        switch (input) {
            case 'aidan spencer': return 'aidanSpencerA';
            case 'i don\'t know': return 'dontKnow';
            case 'i don’t know': return 'dontKnow';
            default: return 'someoneElse';
        }
    },
    someoneElse: function () {

        return 'seeWhatFound';
    },
    error: function () {

        return 'error';
    },
    endAlpha: function () {

        return 'endAlpha';
    }
};
