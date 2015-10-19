var logger = require('debug')('textcapade');

module.exports = {

    // - START ---------------------------- *

    allStartEp6: function (response, user) {

        switch (response) {
            case 'y':
                return { nextSeries: 'yesSignificant' };
            case 'n':
                return { nextSeries: 'notSignificant' };
        }
    },

    // - SHARED ---------------------------- *

    yesSignificant: function () {

        return { nextSeries: 'rabbitHole' };
    },
    notSignificant: function () {

        return { nextSeries: 'rabbitHole' };
    },
    rabbitHole: function (response, user) {

        switch (response) {
            case 'in':
                return { nextSeries: 'inPlay' };
            case 'out':
                return { nextSeries: 'endZetaNotPlay' };
        }
    },
    inPlay: function (response, user) {

        switch (response) {
            case 'stand up':
                return { nextSeries: 'standUp' };
            case 'look around':
                return { nextSeries: 'lookAround' };
        }
    },
    standUp: function (response, user) {

        switch (response) {
            case 'north':
                return { nextSeries: 'goNorth' };
            case 'east':
                return { nextSeries: 'goEast' };
            case 'south':
                return { nextSeries: 'goSouth' };
        }
    },
    lookAround: function (response, user) {

        switch (response) {
            case 'y':
                return { nextSeries: 'yesLook' };
            case 'n':
                return { nextSeries: 'noDontLook' };
        }
    },
    goNorth: function (response, user) {

        switch (response) {
            case 'y':
                return { nextSeries: 'yesWrest' };
            case 'n':
                return { nextSeries: 'doors' };
        }
    },
    yesWrest: function () {

        return { nextSeries: 'doors' };
    },
    doors: function (response, user) {

        switch (response) {
            case 'east':
                return { nextSeries: 'goEastDoors' };
            case 'south':
                return { nextSeries: 'goSouthDoors' };
        }
    },
    goEastDoors: function (response, user) {

        switch (response) {
            case 'north':
                return { nextSeries: 'statues' };
            case 'south':
                return { nextSeries: 'goEast' };
        }
    },
    statues: function (response, user) {

        switch (response) {
            case 'sneak':
                return { nextSeries: 'sneak' };
            case 'run':
                return { nextSeries: 'run' };
        }
    },
    sneak: function () {

        return { nextSeries: 'hallway' };
    },
    run: function () {

        return { nextSeries: 'hallway' };
    },
    hallway: function (response, user) {

        switch (response) {
            case 'get gold':
                return { nextSeries: 'getGold' };
            case 'get out':
                return { nextSeries: 'getOut' };
        }
    },
    getGold: function (response, user) {

        switch (response) {
            case 'take off':
                return { nextSeries: 'takeArmorOff' };
            case 'leave on':
                return { nextSeries: 'leaveArmorOn' };
        }
    },
    takeArmorOff: function () {

        return { nextSeries: 'dragon' };
    },
    leaveArmorOn: function () {

        return { nextSeries: 'dragon' };
    },
    dragon: function (response, user) {

        switch (response) {
            case 'use dagger':
                return { nextSeries: 'useDagger' };
            case 'use elixir':
                return { nextSeries: 'endThetaEp6' };
            default:
                return { nextSeries: 'endRhoEp6' };
        }
    },
    useDagger: function () {

        return { nextSeries: 'endZetaEp6' };
    },
    getOut: function () {

        return { nextSeries: 'dragon' };
    },
    goSouthDoors: function () {

        return { nextSeries: 'goEastDoors' };
    },
    goEast: function () {

        return { nextSeries: 'examine' };
    },
    examine: function (response, user) {

        switch (response) {
            case 'shower':
                return { nextSeries: 'shower' };
            case 'toilet':
                return { nextSeries: 'toilet' };
            case 'cabinet':
                return { nextSeries: 'cabinet' };
        }
    },
    shower: function () {

        return { nextSeries: 'examine' };
    },
    toilet: function (response, user) {

        switch (response) {
            case 'y':
                return { nextSeries: 'yesRoaches' };
            case 'n':
                return { nextSeries: 'examine' };
        }
    },
    yesRoaches: function () {

        return { nextSeries: 'endRhoDeath' };
    },
    cabinet: function (response, user) {

        switch (response) {
            case 'take toothpaste':
                return { nextSeries: 'toothpaste' };
            case 'take elixir':
                return { nextSeries: 'elixir' };
        }
    },
    toothpaste: function () {

        return { nextSeries: 'elixir' };
    },
    elixir: function (response, user) {

        switch (response) {
            case 'west':
                return { nextSeries: 'backToBeginning' };
            case 'north':
                return { nextSeries: 'junction' };
        }
    },
    backToBeginning: function () {

        return { nextSeries: 'backToBeginningChoices' };
    },
    backToBeginningChoices: function (response, user) {

        switch (response) {
            case 'north':
                return { nextSeries: 'blacksmith' };
            case 'south':
                return { nextSeries: 'goSouth' };
            case 'east':
                return { nextSeries: 'bathroom' };
        }
    },
    blacksmith: function () {

        return { nextSeries: 'goEastDoors' };
    },
    bathroom: function () {

        return { nextSeries: 'statues' };
    },
    junction: function (response, user) {

        switch (response) {
            case 'north':
                return { nextSeries: 'statues' };
            case 'south':
                return { nextSeries: 'bathroom' };
            case 'east':
                return { nextSeries: 'zombies' };
        }
    },
    zombies: function (response, user) {

        switch (response) {
            case 'sneak':
                return { nextSeries: 'sneakZombies' };
            case 'run':
                return { nextSeries: 'runZombies' };
        }
    },
    sneakZombies: function () {

        return { nextSeries: 'runZombies' };
    },
    runZombies: function (response, user) {

        switch (response) {
            case 'gold':
                return { nextSeries: 'getGoldZombies' };
            case 'sneak':
                return { nextSeries: 'sneakOut' };
        }
    },
    getGoldZombies: function () {

        return { nextSeries: 'dragonEyes' };
    },
    sneakOut: function () {

        return { nextSeries: 'dragonEyes' };
    },
    dragonEyes: function (response, user) {

        switch (response) {
            case 'use dagger':
                return { nextSeries: 'useDaggerDragonEyes' };
            case 'use elixir':
                return { nextSeries: 'endThetaDragonEyes' };
            default:
                return { nextSeries: 'endRhoEp6' };
        }
    },
    useDaggerDragonEyes: function () {

        return { nextSeries: 'eaten' };
    },
    goSouth: function () {

        return { nextSeries: 'backToBeginningChoices' };
    },

    yesLook: function (response, user) {

        switch (response) {
            case 'stand up':
                return { nextSeries: 'standUp' };
            case 'take a nap':
                return { nextSeries: 'takeANap' };
        }
    },
    noDontLook: function (response, user) {

        switch (response) {
            case 'stand up':
                return { nextSeries: 'standUp' };
            case 'take a nap':
                return { nextSeries: 'takeANap' };
        }
    },
    takeANap: function (response, user) {

        switch (response) {
            case 'stand up':
                return { nextSeries: 'standUp' };
            case 'death':
                return { nextSeries: 'sweetDeath' };
        }
    },
    sweetDeath: function () {

        return { nextSeries: 'endRhoDeath' };
    },

// - ENDINGS ---------------------------- *

    endRhoDeath: function () {

        return { nextSeries: 'end', cohort: 'theta', nextEpisode: 'episode7' };
    },
    endRhoEp6: function () {

        return { nextSeries: 'end', cohort: 'theta', nextEpisode: 'episode7' };
    },
    endThetaEp6: function () {

        return { nextSeries: 'end', cohort: 'theta', nextEpisode: 'episode7' };
    },
    endThetaDragonEyes: function () {

        return { nextSeries: 'end', cohort: 'theta', nextEpisode: 'episode7' };
    },
    endZetaNotPlay: function () {

        return { nextSeries: 'end', cohort: 'zeta', nextEpisode: 'episode7' };
    },
    endZetaEp6: function () {

        return { nextSeries: 'end', cohort: 'zeta', nextEpisode: 'episode7' };
    }

};
