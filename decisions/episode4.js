module.exports = {

    zetaStartEp4: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'doYouAgree' };
            case 'n':
                return { nextSeries: 'onlyActions' };
        }
    },
    onlyActions: function () {

        return { nextSeries: 'whoAmI' };
    },
    doYouAgree: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'machineLikesYou' };
            case 'n':
                return { nextSeries: 'sentimentality' };
        }
    },
    whoAmI: function (input) {

        switch (input) {
            case 'atropos':
                return { nextSeries: 'payingAttention' };
            case 'n':
                return { nextSeries: 'iAmAtropos' };
            default:
                return { nextSeries: 'iAmAtropos' };
        }
    },
    machineLikesYou: function () {

        return { nextSeries: 'pocketCalculator' };
    },
    pocketCalculator: function () {

        return { nextSeries: 'whatsMyName' };
    },
    sentimentality: function () {

        return { nextSeries: 'pocketCalculator' };
    },
    whatsMyName: function (input) {

        switch (input) {
            case 'atropos':
                return { nextSeries: 'payingAttention' };
            default:
                return { nextSeries: 'iAmAtropos' };
        }
    },
    iAmAtropos: function () {

        return { nextSeries: 'areYouPhysician' };
    },
    doYouWantToHear: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'foolishMachine' };
            case 'n':
                return { nextSeries: 'endRhoEp4' };
        }
    },
    foolishMachine: function () {

        return { nextSeries: 'whatsMyName' };
    },
    payingAttention: function () {

        return { nextSeries: 'areYouPhysician' };
    },
    areYouPhysician: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'youWillUnderstand' };
            case 'n':
                return { nextSeries: 'letsPretend' };
        }
    },
    letsPretend: function () {

        return { nextSeries: 'aliveOrDie' };
    },
    youWillUnderstand: function () {

        return { nextSeries: 'aliveOrDie' };
    },
    aliveOrDie: function (input) {

        switch (input) {
            case 'die':
                return { nextSeries: 'renewalImpossible' };
            case 'live':
                return { nextSeries: 'wasteResources' };
        }
    },
    renewalImpossible: function () {

        return { nextSeries: 'rememberOldWorld' };
    },
    wasteResources: function () {

        return { nextSeries: 'rememberOldWorld' };
    },
    rememberOldWorld: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'pastStolen' };
            case 'n':
                return { nextSeries: 'doomed' };
        }
    },
    rhoStartEp4: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'yesHearDavid' };
            case 'n':
                return { nextSeries: 'futilityOfWar' };
        }
    },
    pastStolen: function () {

        return { nextSeries: 'endZetaEp4' };
    },
    doomed: function () {

        return { nextSeries: 'endZetaEp4' };
    },
    thetaStartEp4: function (input) {

        switch (input) {
            case 'atropos':
                return { nextSeries: 'endsAndMeans' };
            default:
                return { nextSeries: 'oneQuestion' };
        }
    },
    oneQuestion: function () {

        return { nextSeries: 'dieOrAlive' };
    },
    endsAndMeans: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'idealistsRelated' };
            case 'n':
                return { nextSeries: 'idealists' };
        }
    },
    idealistsRelated: function () {

        return { nextSeries: 'idealistsRunAfoul' };
    },
    idealists: function () {

        return { nextSeries: 'idealistsRunAfoul' };
    },
    idealistsRunAfoul: function () {

        return { nextSeries: 'areYouPhysicianTwo' };
    },
    epsilonStartEp4: function (input) {

        switch (input) {
            case 'atropos':
                return { nextSeries: 'sidesaddle' };
            default:
                return { nextSeries: 'oneQuestion' };
        }
    },
    sidesaddle: function () {

        return { nextSeries: 'idealistsRunAfoul' };
    },
    areYouPhysicianTwo: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'youWillUnderstandTwo' };
            case 'n':
                return { nextSeries: 'letsPretendTwo' };
        }
    },
    youWillUnderstandTwo: function () {

        return { nextSeries: 'dieOrAlive' };
    },
    letsPretendTwo: function () {

        return { nextSeries: 'dieOrAlive' };
    },
    dieOrAlive: function (input) {

        switch (input) {
            case 'live':
                return { nextSeries: 'liveOrDie' };
            case 'die':
                return { nextSeries: 'wiseChoice' };
        }
    },
    liveOrDie: function (input) {

        switch (input) {
            case 'live':
                return { nextSeries: 'rememberPast' };
            case 'die':
                return { nextSeries: 'wiseChoice' };
        }
    },
    wiseChoice: function () {

        return { nextSeries: 'renewalImpossible' };
    },
    rememberPast: function (input) {

        switch (input) {
            case 'y':
                return { nextSeries: 'yesYouRemember' };
            case 'n':
                return { nextSeries: 'noRemember' };
        }
    },
    yesYouRemember: function () {

        return { nextSeries: 'endThetaEp4' };
    },
    noRemember: function () {

        return { nextSeries: 'endThetaEp4' };
    },
    yesHearDavid: function () {

        return { nextSeries: 'doYouWantToHear' };
    },
    futilityOfWar: function () {

        return { nextSeries: 'doYouWantToHear' };
    },
    endThetaEp4: function () {

        return { nextSeries: 'end', cohort: 'theta', nextEpisode: 'episode5' };
    },
    endZetaEp4: function () {

        return { nextSeries: 'end', cohort: 'zeta', nextEpisode: 'episode5' };
    },

    //- DEAD END ----------------------*

    endRhoEp4: function () {

        return { nextSeries: 'end', cohort: 'rho' };
    }
};
