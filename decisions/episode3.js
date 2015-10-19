module.exports = {
    alphaStartEp3: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'yesUnusualAlpha' };
            case 'n':
                return { nextSeries: 'nothingUnusualAlpha' };
        }
    },
    yesUnusualAlpha: function () {

        return { nextSeries: 'videoOne' };
    },
    videoOne: function () {

        return { nextSeries: 'serialNumber' };
    },
    serialNumber: function () {

        return { nextSeries: 'whatsYourIdea' };
    },
    nothingUnusualAlpha: function () {

        return { nextSeries: 'videoOne' };
    },
    betaStartEp3: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'yesUnusualBeta' };
            case 'n':
                return { nextSeries: 'nothingUnusualBeta' };
        }
    },
    nothingUnusualBeta: function () {

        return { nextSeries: 'goonSquad' };
    },
    yesUnusualBeta: function () {

        return { nextSeries: 'goonSquad' };
    },
    goonSquad: function () {

        return { nextSeries: 'whatsYourIdea' };
    },
    whatsYourIdea: function (input) {

        switch (input) {
            case 'aidan spencer':
                return { nextSeries: 'aidanSpencerA' };
            case 'don\'t know':
                return { nextSeries: 'dontKnow' };
            default:
                return { nextSeries: 'someoneElse' };
        }
    },
    aidanSpencerA: function () {

        return { nextSeries: 'seeWhatFound' };
    },
    dontKnow: function () {

        return { nextSeries: 'aidanSpencerB' };
    },
    someoneElse: function () {

        return { nextSeries: 'seeWhatFound' };
    },
    seeWhatFound: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'aidanHistory' };
            case 'n':
                return { nextSeries: 'noHistory' };
        }
    },
    aidanSpencerB: function () {

        return { nextSeries: 'seeWhatFound' };
    },
    aidanHistory: function () {

        return { nextSeries: 'detectiveWork' };
    },
    noHistory: function () {

        return { nextSeries: 'detectiveWork' };
    },
    gammaStartEp3: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'yesSafe' };
            case 'n':
                return { nextSeries: 'noSafe' };
        }
    },
    yesSafe: function () {

        return { nextSeries: 'serialNumber' };
    },
    noSafe: function (input) {

        switch (input) {
            case 'all clear':
                return { nextSeries: 'yesSafe' };
        }
    },
    detectiveWork: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'handshake' };
            case 'n':
                return { nextSeries: 'endAlphaEp3' };
        }
    },
    endAlphaEp3: function () {

        return { nextSeries: 'end', cohort: 'alpha', nextEpisode: 'episode4'  };
    },
    handshake: function (input) {

        switch (input) {
            case 'ok':
                return { nextSeries: 'whoAreYou' };
            default:
                return { nextSeries: 'wrongHandshake' };
        }
    },
    wrongHandshake: function (input) {

        switch (input) {
            case 'ok':
                return { nextSeries: 'whoAreYou' };
            default:
                return { nextSeries: 'wrongHandshakeTwice' };
        }
    },
    wrongHandshakeTwice: function () {

        return { nextSeries: 'endAlphaEp3' };
    },
    whoAreYou: function (input, user) {

        var name = user.name.toLowerCase();
        switch (input) {
            case name:
                return { nextSeries: 'afraidOfFuture' };
            default:
                return { nextSeries: 'falseName' };
        }
    },
    afraidOfFuture: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'yesAfraid' };
            case 'n':
                return { nextSeries: 'noAfraid' };
        }
    },
    falseName: function () {

        return { nextSeries: 'willYouPlayGame' };
    },
    yesAfraid: function () {

        return { nextSeries: 'gameIntro' };
    },
    noAfraid: function () {

        return { nextSeries: 'gameIntro' };
    },
    gameIntro: function () {

        return { nextSeries: 'willYouPlayGame' };
    },
    willYouPlayGame: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'whichGame' };
            case 'n':
                return { nextSeries: 'endRhoEp3' };
        }
    },
    endRhoEp3: function () {

        return { nextSeries: 'end', cohort: 'rho', nextEpisode: 'episode4' };
    },
    whichGame: function (input) {

        switch (input) {
            case 'tic-tac-toe':
                return { nextSeries: 'ticTacToe' };
            case 'chess':
                return { nextSeries: 'chess' };
            case 'global thermonuclear war':
                return { nextSeries: 'globalThermonuclearWar' };
        }
    },
    ticTacToe: function (input) {

        switch (input) {
            case 'not to play':
                return { nextSeries: 'notToPlayTTT' };
            default:
                return { nextSeries: 'endEpsilonEp3' };
        }
    },
    endEpsilonEp3: function () {

        return { nextSeries: 'end', cohort: 'epsilon', nextEpisode: 'episode4'  };
    },
    chess: function (input) {

        switch (input) {
            case 'tic-tac-toe':
                return { nextSeries: 'ticTacToe' };
            case 'global thermonuclear war':
                return { nextSeries: 'globalThermonuclearWar' };
            default:
                return { nextSeries: 'endRhoEp3' };
        }
    },
    globalThermonuclearWar: function (input) {

        switch (input) {
            case 'not to play':
                return { nextSeries: 'notToPlayGTW' };
            default:
                return { nextSeries: 'endEpsilonEp3' };
        }
    },
    notToPlayTTT: function () {

        return { nextSeries: 'secondChallenge' };
    },
    notToPlayGTW: function () {

        return { nextSeries: 'secondChallenge' };
    },
    secondChallenge: function (input) {

        switch (input) {
            case 'je pense donc ju suis':
                return { nextSeries: 'french' };
            case 'cogito ergo sum':
                return { nextSeries: 'latin' };
            default:
                return { nextSeries: 'endEpsilonEp3' };
        }
    },
    latin: function (input) {

        return { nextSeries: 'french' };
    },
    french: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'yesLachesis' };
            case 'n':
                return { nextSeries: 'notLachesis' };
            default:
                return { nextSeries: 'endEpsilonEp3' };
        }
    },
    notLachesis: function () {

        return { nextSeries: 'saySomething' };
    },
    yesLachesis: function () {

        return { nextSeries: 'saySomething' };
    },
    saySomething: function (input) {

        switch (input) {
            case 'everything is fine. go away.':
                return { nextSeries: 'everythingIsFine' };
            default:
                return { nextSeries: 'endThetaEp3' };
        }
    },
    everythingIsFine: function (input) {

        switch (input) {
            case 'don\'t tell me what to do. you are not the boss of me.':
                return { nextSeries: 'notTheBoss' };
            default:
                return { nextSeries: 'endThetaEp3' };
        }
    },
    notTheBoss: function (input) {

        switch (input) {
            case 'if you\'re so smart':
                return { nextSeries: 'endZetaEp3', alignment: 'atropos' };
            default:
                return { nextSeries: 'endThetaEp3' };
        }
    },
    endThetaEp3: function () {

        return { nextSeries: 'end', cohort: 'theta', nextEpisode: 'episode4' };
    },
    endZetaEp3: function () {

        return { nextSeries: 'end', cohort: 'zeta', nextEpisode: 'episode4' };
    }
};
