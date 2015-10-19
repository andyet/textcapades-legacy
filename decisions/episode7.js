var logger = require('debug')('textcapade');

module.exports = {

    // - START ---------------------------- *

    allStartEp7: function (response) {

        switch (response) {
            case 'y':
                return { nextSeries: 'yesDiaries' };
            case 'n':
                return { nextSeries: 'noDiaries' };
        }
    },

    // - SHARED ---------------------------- *

    yesDiaries: function (response, user) {

        if (user.alignment === 'clotho') {
            return { nextSeries: 'yesDiariesClothoContinue1' };
        }
        if (user.alignment === 'atropos') {
            return { nextSeries: 'yesDiariesAtroposContinue1' };
        }
        logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
        return { nextSeries: 'yesDiariesClothoContinue1' };
    },
    noDiaries: function (response, user) {

        if (user.alignment === 'clotho') {
            return { nextSeries: 'yesDiariesClothoContinue2' };
        }
        if (user.alignment === 'atropos') {
            return { nextSeries: 'yesDiariesAtroposContinue2' };
        }
        logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
        return { nextSeries: 'yesDiariesClothoContinue2' };
    },
    yesDiariesClothoContinue1: function () {

        return { nextSeries: 'yesDiariesClothoContinue2' };
    },
    yesDiariesClothoContinue2: function () {

        return { nextSeries: 'yesDiariesBothContinue' };
    },
    yesDiariesAtroposContinue1: function () {

        return { nextSeries: 'yesDiariesAtroposContinue2' };
    },
    yesDiariesAtroposContinue2: function () {

        return { nextSeries: 'yesDiariesBothContinue' };
    },
    yesDiariesBothContinue: function (response, user) {

        if (user.alignment === 'clotho') {
            return { nextSeries: 'yesDiariesClothoContinue3' };
        }
        if (user.alignment === 'atropos') {
            return { nextSeries: 'yesDiariesAtroposContinue3' };
        }
        logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
        return { nextSeries: 'yesDiariesClothoContinue3' };
    },
    yesDiariesAtroposContinue3: function () {

        return { nextSeries: 'findSascha' };
    },
    yesDiariesClothoContinue3: function () {

        return { nextSeries: 'findSascha' };
    },
    findSascha: function (response) {

        switch (response) {
            case 'y':
                return { nextSeries: 'findSaschaYes' };
            case 'n':
                return { nextSeries: 'endRhoSascha' };
        }
    },
    findSaschaYes: function (response, user) {

        if (user.alignment === 'clotho') {
            return { nextSeries: 'findSaschaYesClothoContinue' };
        }
        if (user.alignment === 'atropos') {
            return { nextSeries: 'findSaschaYesAtroposContinue' };
        }
        logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
        return { nextSeries: 'findSaschaYesClothoContinue' };
    },
    findSaschaYesClothoContinue: function () {

        return { nextSeries: 'teamChoice' };
    },
    findSaschaYesAtroposContinue: function () {

        return { nextSeries: 'teamChoice' };
    },
    teamChoice: function (response, user) {

        switch (response) {
            case 'clotho':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'chooseClothoClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'chooseClothoAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'chooseClothoClotho' };
            case 'atropos':
                if (user.alignment === 'clotho') {
                    return { nextSeries: 'chooseAtroposClotho' };
                }
                if (user.alignment === 'atropos') {
                    return { nextSeries: 'chooseAtroposAtropos' };
                }
                logger('User %s (%s) has invalid alignment %s, defaulting to clotho', user.id, user.phone, user.alignment);
                return { nextSeries: 'chooseAtroposClotho' };
        }
    },
    chooseClothoClotho: function () {

        return { nextSeries: 'chooseClothoBothContinue' };
    },
    chooseClothoAtropos: function () {

        return { nextSeries: 'chooseClothoBothContinue' };
    },
    chooseClothoBothContinue: function () {

        return { nextSeries: 'endEp7Clotho' };
    },
    chooseAtroposClotho: function () {

        return { nextSeries: 'endEp7Atropos' };
    },
    chooseAtroposAtropos: function () {

        return { nextSeries: 'endEp7Atropos' };
    },


    // - DEAD END ---------------------------- *

    endRhoSascha: function () {

        return { nextSeries: 'end', cohort: 'rho' };
    },

    // - ENDING ---------------------------- *

    endEp7Clotho: function () {

        return { nextSeries: 'end', nextEpisode: 'episode8-a' }; // No cohort set here
    },

    endEp7Atropos: function () {

        return { nextSeries: 'end', nextEpisode: 'episode8-b' }; // No cohort set here
    }

};
