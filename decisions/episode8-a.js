// - THE ONE THAT COMES FROM CLOTHO ---------------------------- *

var logger = require('debug')('textcapade');

module.exports = {

    // - START ---------------------------- *

    allStartEp8a: function (response, user) {

        if (user.alignment === 'clotho') {
            return { nextSeries: 'startContinueClotho' };
        }
        if (user.alignment === 'atropos') {
            return { nextSeries: 'startContinueAtropos' };
        }
        logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
        return { nextSeries: 'startContinueClotho' };
    },

    // - SHARED ---------------------------- *

    startContinueClotho: function () {

        return { nextSeries: 'startContinueBoth' };
    },
    startContinueAtropos: function () {

        return { nextSeries: 'startContinueBoth' };
    },
    startContinueBoth: function (response, user) {

        if (user.alignment === 'clotho') {
            return { nextSeries: 'eyeClotho' };
        }
        if (user.alignment === 'atropos') {
            return { nextSeries: 'eyeAtropos' };
        }
        logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
        return { nextSeries: 'eyeClotho' };
    },
    eyeClotho: function () {

        return { nextSeries: 'lookAtMap' };
    },
    eyeAtropos: function () {

        return { nextSeries: 'lookAtMap' };
    },
    lookAtMap: function (response) {

        switch (response) {
            case 'north':
                return { nextSeries: 'north' };
            case 'south':
                return { nextSeries: 'south' };
        }
    },
    north: function (response, user) {

        switch (response) {
            case 'swim':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'swimClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'swimAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'swimClotho' };
            case 'walk':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'walkClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'walkAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'walkClotho' };
        }
    },
    swimClotho: function () {

        return { nextSeries: 'swimBothContinue' };
    },
    swimAtropos: function () {

        return { nextSeries: 'swimBothContinue' };
    },
    whichLane: function (response) {

        switch (response) {
            case 'east':
                return { nextSeries: 'east' };
            case 'west':
                return { nextSeries: 'west' };
        }
    },
    east: function (response, user) {

        switch (response) {
            case 'jump':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'jumpClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'jumpAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'jumpClotho' };
            case 'sneak':
                return { nextSeries: 'sneakPast' };
        }
    },
    jumpClotho: function () {

        return { nextSeries: 'jumpBothContinue' };
    },
    jumpAtropos: function () {

        return { nextSeries: 'jumpBothContinue' };
    },
    jumpBothContinue: function () {

        return { nextSeries: 'tooEasy' };
    },
    tooEasy: function () {

        return { nextSeries: 'mainThoroughfare' };
    },
    sneakPast: function () {

        return { nextSeries: 'mainThoroughfare' };
    },
    mainThoroughfare: function (response, user) {

        switch (response) {
            case 'east':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'eastClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'eastAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'eastClotho' };
            case 'west':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'westClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'westAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'westClotho' };
        }
    },
    westClotho: function () {

        return { nextSeries: 'door' };
    },
    westAtropos: function () {

        return { nextSeries: 'door' };
    },
    door: function () {

        return { nextSeries: 'talkOrOut' };
    },
    eastClotho: function () {

        return { nextSeries: 'annex' };
    },
    eastAtropos: function () {

        return { nextSeries: 'annex' };
    },
    annex: function () {

        return { nextSeries: 'talkOrOut' };
    },
    talkOrOut: function (response) {

        switch (response) {
            case 'talk to her':
                return { nextSeries: 'talk' };
            case 'get her out':
                return { nextSeries: 'getHerOut' };
        }
    },
    talk: function () {

        return { nextSeries: 'holyCrap' };
    },
    holyCrap: function (response) {

        switch (response) {
            case 'grab her':
                return { nextSeries: 'grabHer' };
            case 'run':
                return { nextSeries: 'justRun' };
        }
    },
    grabHer: function () {

        return { nextSeries: 'youWere' };
    },
    youWere: function (response, user) {

        if (user.alignment === 'clotho') {
            return { nextSeries: 'grabHerClothoContinue' };
        }
        if (user.alignment === 'atropos') {
            return { nextSeries: 'grabHerAtroposContinue' };
        }
        logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
        return { nextSeries: 'grabHerClothoContinue' };
    },
    grabHerClothoContinue: function () {

        return { nextSeries: 'endThetaEp8a' };
    },
    grabHerAtroposContinue: function () {

        return { nextSeries: 'endThetaEp8a' };
    },
    justRun: function () {

        return { nextSeries: 'youWere' };
    },
    getHerOut: function () {

        return { nextSeries: 'holyCrap' };
    },
    west: function (response, user) {

        switch (response) {
            case 'jump':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'jumpClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'jumpAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'jumpClotho' };
            case 'swim':
                return { nextSeries: 'swim' };
        }
    },
    swim: function () {

        return { nextSeries: 'bridge' };
    },
    bridge: function () {

        return { nextSeries: 'tooEasy' };
    },
    walkClotho: function () {

        return { nextSeries: 'whichLane' };
    },
    walkAtropos: function () {

        return { nextSeries: 'whichLane' };
    },
    swimBothContinue: function () {

        return { nextSeries: 'bridge' };
    },
    south: function (response, user) {

        switch (response) {
            case 'fence':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'fenceClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'fenceAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'fenceClotho' };
            case 'ride':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'rideClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'rideAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'rideClotho' };
        }
    },
    fenceClotho: function () {

        return { nextSeries: 'gateOpening' };
    },
    fenceAtropos: function () {

        return { nextSeries: 'gateOpening' };
    },
    gateOpening: function () {

        return { nextSeries: 'thanksgiving' };
    },
    thanksgiving: function () {

        return { nextSeries: 'mainThoroughfare' };
    },
    rideClotho: function () {

        return { nextSeries: 'rideBothContinue' };
    },
    rideAtropos: function () {

        return { nextSeries: 'rideBothContinue' };
    },
    rideBothContinue: function () {

        return { nextSeries: 'thanksgiving' };
    },


    // - ENDINGS ---------------------------- *

    endThetaEp8a: function () {

        return { nextSeries: 'end', cohort: 'theta', alignment: 'clotho', nextEpisode: 'episode9-a' }; // Next episode
    }
};
