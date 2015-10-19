// - THE ONE THAT COMES FROM ATROPOS ---------------------------- *

var logger = require('debug')('textcapade');

module.exports = {

    // - START ---------------------------- *
    allStartEp8b: function (response, user) {

        if (user.alignment === 'clotho') {
            return { nextSeries: 'chooseAtroposClothoContinue' };
        }
        if (user.alignment === 'atropos') {
            return { nextSeries: 'chooseAtroposAtroposContinue' };
        }
        logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
        return { nextSeries: 'chooseAtroposClothoContinue' };
    },
    chooseAtroposClothoContinue: function () {

        return { nextSeries: 'onBoardOrBail' };
    },
    chooseAtroposAtroposContinue: function () {

        return { nextSeries: 'onBoardOrBail' };
    },
    onBoardOrBail: function (response) {

        switch (response) {
            case 'onboard':
                return { nextSeries: 'onBoard' };
            case 'bail':
                return { nextSeries: 'endEp8bClotho' }; // Goes back to Clotho
        }
    },
    onBoard: function (response) {

        switch (response) {
            case 'fenceline':
                return { nextSeries: 'fenceline' };
            case 'northeast':
                return { nextSeries: 'northeast' };
        }
    },
    fenceline: function () {

        return { nextSeries: 'encounterArmor' };
    },
    encounterArmor: function (response) {

        switch (response) {
            case 'protection':
                return { nextSeries: 'protection' };
            case 'stealth':
                return { nextSeries: 'stealth' };
        }
    },
    protection: function () {

        return { nextSeries: 'fencelineContinue' };
    },
    stealth: function () {

        return { nextSeries: 'fencelineContinue' };
    },
    fencelineContinue: function (response, user) {

        if (user.answer_blob.onBoard === 'fenceline') {
            logger('User %s (%s) has has arrived at this prompt via fenceline, therefore they will continue to gateOrNorthern prompt', user.id, user.phone, user.answer_blob);
            return { nextSeries: 'gateOrNorthern' };
        }
        return { nextSeries: 'easternMarsh' };

    },
    gateOrNorthern: function (response) {

        switch (response) {
            case 'gate':
                return { nextSeries: 'gate' };
            case 'northern':
                return { nextSeries: 'northeast' };
        }
    },
    gate: function (response, user) {

        switch (response) {
            case 'hilltop':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'hilltopClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'hilltopAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'hilltopClotho' };
            case 'flag':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'flagClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'flagAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'flagClotho' };
        }
    },
    hilltopClotho: function () {

        return { nextSeries: 'hilltopBothContinue' };
    },
    hilltopAtropos: function () {

        return { nextSeries: 'hilltopBothContinue' };
    },
    hilltopBothContinue: function (response, user) {

        if (user.answer_blob.encounterArmor === 'protection') {
            return { nextSeries: 'hilltopContinueProtection' };
        }
        if (user.answer_blob.encounterArmor === 'stealth') {
            return { nextSeries: 'hilltopContinueStealth' };
        }
        logger('User %s (%s) has invalid answer %s, defaulting to protection', user.id, user.phone, user.answer_blob);
        return { nextSeries: 'hilltopContinueProtection' };
    },
    hilltopContinueProtection: function () {

        return { nextSeries: 'topOfTrailer' };
    },
    hilltopContinueStealth: function () {

        return { nextSeries: 'topOfTrailer' };
    },
    topOfTrailer: function () {

        return { nextSeries: 'shouldIStun' };
    },
    shouldIStun: function (response, user) {

        switch (response) {
            case 'y':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'yesStunClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'yesStunAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'yesStunClotho' };
            case 'n':
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'noDontStunClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'noDontStunAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'noDontStunClotho' };
        }
    },
    yesStunClotho: function () {

        return { nextSeries: 'damnIt' };
    },
    yesStunAtropos: function () {

        return { nextSeries: 'damnIt' };
    },
    noDontStunClotho: function () {

        return { nextSeries: 'damnIt' };
    },
    noDontStunAtropos: function () {

        return { nextSeries: 'damnIt' };
    },
    damnIt: function (response, user) {

        if (user.answer_blob.encounterArmor === 'protection') {
            return { nextSeries: 'armorHoldingUp' };
        }
        if (user.answer_blob.encounterArmor === 'stealth') {
            return { nextSeries: 'wishIdWorn' };
        }
        logger('User %s (%s) has invalid answer %s, defaulting to protection', user.id, user.phone, user.answer_blob);
        return { nextSeries: 'armorHoldingUp' };
    },
    armorHoldingUp: function () {

        return { nextSeries: 'thatsIt' };
    },
    wishIdWorn: function () {

        return { nextSeries: 'thatsIt' };
    },
    thatsIt: function () {

        return { nextSeries: 'twoOptions' };
    },
    twoOptions: function (response) {

        switch (response) {
            case 'power station':
                return { nextSeries: 'powerStation' };
            case 'barracks':
                return { nextSeries: 'barracks' };
        }
    },
    powerStation: function () {

        return { nextSeries: 'justGo' };
    },
    justGo: function (response, user) {

        if (user.answer_blob.encounterArmor === 'protection') {
            return { nextSeries: 'powerStationContinueProtection' };
        }
        if (user.answer_blob.encounterArmor === 'stealth') {
            return { nextSeries: 'powerStationContinueStealth' };
        }
        logger('User %s (%s) has invalid answer %s, defaulting to protection', user.id, user.phone, user.answer_blob);
        return { nextSeries: 'powerStationContinueProtection' };
    },
    powerStationContinueProtection: function (response, user) {

        if (user.answer_blob.guardDogProtection === 'n') {
            return { nextSeries: 'dogTook' };
        }
        if (user.answer_blob.guardDogProtection === 'y') {
            return { nextSeries: 'mightSurvive' };
        }
        logger('User %s (%s) has invalid answer %s, defaulting to n', user.id, user.phone, user.answer_blob);
        return { nextSeries: 'dogTook' };
    },
    dogTook: function (response) {

        switch (response) {
            case 'wait':
                return { nextSeries: 'wait' };
            case 'warn':
                return { nextSeries: 'fifteenSeconds' };
        }
    },
    fifteenSeconds: function () {

        return { nextSeries: 'endZetaRun' };
    },
    mightSurvive: function (response) {

        switch (response) {
            case 'wait':
                return { nextSeries: 'wait' };
            case 'warn':
                return { nextSeries: 'fifteenSeconds' };
        }
    },
    wait: function () {

        return { nextSeries: 'fifteenSeconds' };
    },
    powerStationContinueStealth: function (response) {

        switch (response) {
            case 'run':
                return { nextSeries: 'guardRun' };
            case 'stun':
                return { nextSeries: 'guardStun' };
        }
    },
    guardRun: function () {

        return { nextSeries: 'fifteenSeconds' };
    },
    guardStun: function () {

        return { nextSeries: 'fifteenSeconds' };
    },
    barracks: function (response, user) {

        if (user.answer_blob.encounterArmor === 'protection') {
            return { nextSeries: 'barracksContinueProtection' };
        }
        if (user.answer_blob.encounterArmor === 'stealth') {
            return { nextSeries: 'barracksContinueStealth' };
        }
        logger('User %s (%s) has invalid answer %s, defaulting to protection', user.id, user.phone, user.answer_blob);
        return { nextSeries: 'barracksContinueProtection' };
    },
    barracksContinueProtection: function () {

        return { nextSeries: 'getHimOutside' };
    },
    barracksContinueStealth: function (response) {

        switch (response) {
            case 'go':
                return { nextSeries: 'justGo' };
            case 'warn':
                return { nextSeries: 'warnHim' };
        }
    },
    warnHim: function (response, user) {

        if (user.alignment === 'clotho') {
            return { nextSeries: 'warnHimContinueClotho' };
        }
        if (user.alignment === 'atropos') {
            return { nextSeries: 'warnHimContinueAtropos' };
        }
        logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
        return { nextSeries: 'warnHimContinueClotho' };
    },
    warnHimContinueClotho: function () {

        return { nextSeries: 'getHimOutside' };
    },
    warnHimContinueAtropos: function () {

        return { nextSeries: 'getHimOutside' };
    },
    getHimOutside: function () {

        return { nextSeries: 'endZetaRun' };
    },
    flagClotho: function (response, user) {

        if (user.answer_blob.encounterArmor === 'protection') {
            return { nextSeries: 'flagContinueProtection' };
        }
        if (user.answer_blob.encounterArmor === 'stealth') {
            return { nextSeries: 'flagContinueStealth' };
        }
        logger('User %s (%s) has invalid answer %s, defaulting to protection', user.id, user.phone, user.answer_blob);
        return { nextSeries: 'flagContinueProtection' };
    },
    flagAtropos: function (response, user) {

        if (user.answer_blob.encounterArmor === 'protection') {
            return { nextSeries: 'flagContinueProtection' };
        }
        if (user.answer_blob.encounterArmor === 'stealth') {
            return { nextSeries: 'flagContinueStealth' };
        }
        logger('User %s (%s) has invalid answer %s, defaulting to protection', user.id, user.phone, user.answer_blob);
        return { nextSeries: 'flagContinueProtection' };
    },
    flagContinueProtection: function () {

        return { nextSeries: 'damnIt' };
    },
    flagContinueStealth: function () {

        return { nextSeries: 'shouldIStun' };
    },
    northeast: function (response, user) {

        if (user.answer_blob.encounterArmor) {
            return { nextSeries: 'easternMarsh' };
        }
        logger('User %s (%s) has not encountered the armor, therefore will be sent to encounterArmor prompt', user.id, user.phone, user.answer_blob);
        return { nextSeries: 'encounterArmor' };
    },
    easternMarsh: function (response, user) {

        if (user.answer_blob.encounterArmor === 'protection') {
            return { nextSeries: 'guardDogProtection' };
        }
        if (user.answer_blob.encounterArmor === 'stealth') {
            return { nextSeries: 'guardDogStealth' };
        }
        logger('User %s (%s) has invalid answer %s, defaulting to protection', user.id, user.phone, user.answer_blob);
        return { nextSeries: 'guardDogProtection' };
    },
    guardDogProtection: function (response, user) {

        switch (response) {
            case 'y':
                return { nextSeries: 'yesHit' };
            case 'n':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'dontHitClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'dontHitAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'dontHitClotho' };
        }
    },
    yesHit: function () {

        return { nextSeries: 'diving' };
    },
    dontHitClotho: function () {

        return { nextSeries: 'diving' };
    },
    dontHitAtropos: function () {

        return { nextSeries: 'diving' };
    },
    diving: function () {

        return { nextSeries: 'swampAss' };
    },
    swampAss: function () {

        return { nextSeries: 'twoOptions' };
    },
    guardDogStealth: function (response) {

        switch (response) {
            case 'rock':
                return { nextSeries: 'rock' };
            case 'mud':
                return { nextSeries: 'mud' };
        }
    },
    rock: function () {

        return { nextSeries: 'swampAss' };
    },
    mud: function () {

        return { nextSeries: 'swampAss' };
    },

    // - ENDINGS ---------------------------- *

    endEp8bClotho: function () {

        return { nextSeries: 'end', alignment: 'clotho', nextEpisode: 'episode8-a' };
    },

    endZetaRun: function () {

        return { nextSeries: 'end', cohort: 'zeta', alignment: 'atropos', nextEpisode: 'episode9-b' }; // Next episode
    }


};
