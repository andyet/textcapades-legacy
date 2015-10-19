var logger = require('debug')('textcapade');

module.exports = {

    // - ZETA ---------------------------- *

    zetaStartEp5: function (response, user) { //-z

        switch (response) {
            case 'y':
                return { nextSeries: 'alwaysOutward' };
            case 'n':
                return { nextSeries: 'weCanHeal' };
        }
    },
    alwaysOutward: function () { //-z

        return { nextSeries: 'spencerFortune' };
    },
    weCanHeal: function () { //-z

        return { nextSeries: 'spencerFortune' };
    },
    spencerFortune: function (response) { //-z

        switch (response) {
            case 'y':
                return { nextSeries: 'whatDidItGive' };
            case 'n':
                return { nextSeries: 'extract' };
        }
    },
    whatDidItGive: function () { //-z

        return { nextSeries: 'thingOfEvil' };
    },
    extract: function () { //-z

        return { nextSeries: 'shouldHaveKnown' };
    },
    shouldHaveKnown: function () { //-z

        return { nextSeries: 'thingOfEvil' };
    },
    thingOfEvil: function () { //-z

        return { nextSeries: 'weKnewEachOther' };
    },
    weaknesses: function () {

        return { nextSeries: 'cantReveal' };
    },
    zetaAfraid: function () {

        return { nextSeries: 'immune' };
    },

    // - THETA ---------------------------- *

    thetaStartEp5: function (response, user) { //-t

        switch (response) {
            case 'y':
                return { nextSeries: 'iSawThat' };
            case 'n':
                return { nextSeries: 'capitalEvil' };
        }
    },
    iSawThat: function () { //-t

        return { nextSeries: 'iveHadAChance' };
    },
    capitalEvil: function () { //-t

        return { nextSeries: 'iveHadAChance' };
    },
    iveHadAChance: function () { //-t

        return { nextSeries: 'weKnewEachOther' };
    },
    thetaAfraid: function () {

        return { nextSeries: 'immune' };
    },
    betterWay: function () {

        return { nextSeries: 'immune' };
    },
    weaknessesTheta: function () {

        return { nextSeries: 'cantReveal' };
    },

    // - SHARED ---------------------------- *

    weKnewEachOther: function (response, user) { //-z

        if (user.answer_blob.askTerritory === 'arthaus') {
            return { nextSeries: 'arthaus' };
        }
        if (user.answer_blob.askTerritory === 'state of play') {
            return { nextSeries: 'stateOfPlay' };
        }
        if (user.answer_blob.askTerritory === 'tech republic') {
            return { nextSeries: 'techRepublic' };
        }
        if (user.answer_blob.askTerritory === 'writers\' bloc') {
            return { nextSeries: 'writersBloc' };
        }
        logger('User %s (%s) has no answer for askTerritory, defaulting to techRepublic', user.id, user.phone);
        return { nextSeries: 'techRepublic' };
    },
    writersBloc: function (response, user) {

        if (user.cohort.name === 'zeta') {
            switch (response) {
                case 'angry':
                    return { nextSeries: 'angry' };
                case 'afraid':
                    return { nextSeries: 'zetaAfraid' };
            }
        }
        if (user.cohort.name === 'theta') {
            switch (response) {
                case 'angry':
                    return { nextSeries: 'angry' };
                case 'afraid':
                    return { nextSeries: 'thetaAfraid' };
            }
        }
        logger('User %s (%s) has invalid cohort %s, defaulting to theta', user.id, user.phone, user.cohort.name);
        switch (response) {
            case 'angry':
                return { nextSeries: 'angry' };
            case 'afraid':
                return { nextSeries: 'thetaAfraid' };
        }
    },
    techRepublic: function (response, user) {

        if (user.cohort.name === 'zeta') {
            switch (response) {
                case 'strengths':
                    return { nextSeries: 'strengths' };
                case 'weaknesses':
                    return { nextSeries: 'weaknesses' };
            }
        }
        if (user.cohort.name === 'theta') {
            switch (response) {
                case 'strengths':
                    return { nextSeries: 'strengths' };
                case 'weaknesses':
                    return { nextSeries: 'weaknessesTheta' };
            }
        }
        logger('User %s (%s) has invalid cohort %s, defaulting to theta', user.id, user.phone, user.cohort.name);
        switch (response) {
            case 'strengths':
                return { nextSeries: 'strengths' };
            case 'weaknesses':
                return { nextSeries: 'weaknessesTheta' };
        }
    },
    strengths: function () {

        return { nextSeries: 'cantReveal' };
    },
    arthaus: function (response) {

        switch (response) {
            case 'y':
                return { nextSeries: 'yesMoll' };
            case 'n':
                return { nextSeries: 'noMoll' };
        }
    },
    stateOfPlay: function (response) {

        switch (response) {
            case 'y':
                return { nextSeries: 'yesCake' };
            case 'n':
                return { nextSeries: 'noCake' };
        }
    },
    angry: function (response, user) {

        if (user.cohort.name === 'zeta') {
            return { nextSeries: 'immune' };
        }
        if (user.cohort.name === 'theta') {
            return { nextSeries: 'betterWay' };
        }
        logger('User %s (%s) has invalid cohort %s at angry, defaulting to theta', user.id, user.phone, user.cohort.name);
        return { nextSeries: 'betterWay' };
    },
    immune: function () {

        return { nextSeries: 'diaries' };
    },
    diaries: function (response, user) {

        if (user.cohort.name === 'zeta') {
            return { nextSeries: 'endZetaDiaries' };
        }
        if (user.cohort.name === 'theta') {
            return { nextSeries: 'endThetaDiaries' };
        }
        logger('User %s (%s) has invalid cohort %s at diaries, defaulting to theta', user.id, user.phone, user.cohort.name);
        return { nextSeries: 'endThetaDiaries' };
    },
    yesMoll: function () {

        return { nextSeries: 'everyDamnDay' };
    },
    noMoll: function () {

        return { nextSeries: 'everyDamnDay' };
    },
    cantReveal: function (response, user) {

        if (user.cohort.name === 'zeta') {
            return { nextSeries: 'endZetaTR' };
        }
        if (user.cohort.name === 'theta') {
            return { nextSeries: 'endThetaTR' };
        }
        logger('User %s (%s) has invalid cohort %s at cantReveal, defaulting to theta', user.id, user.phone, user.cohort.name);
        return { nextSeries: 'endThetaTR' };
    },
    everyDamnDay: function (response, user) {

        if (user.cohort.name === 'zeta') {
            return { nextSeries: 'endZetaMoll' };
        }
        if (user.cohort.name === 'theta') {
            return { nextSeries: 'endThetaMoll' };
        }
        logger('User %s (%s) has invalid cohort %s at everyDamnDay, defaulting to theta', user.id, user.phone, user.cohort.name);
        return { nextSeries: 'endThetaMoll' };
    },
    yesCake: function () {

        return { nextSeries: 'splitCake' };
    },
    noCake: function () {

        return { nextSeries: 'splitCake' };
    },
    splitCake: function (response, user) {

        if (user.cohort.name === 'zeta') {
            return { nextSeries: 'endZetaCake' };
        }
        if (user.cohort.name === 'theta') {
            return { nextSeries: 'endThetaCake' };
        }
        logger('User %s (%s) has invalid cohort %s at splitCake, defaulting to theta', user.id, user.phone, user.cohort.name);
        return { nextSeries: 'endThetaCake' };
    },

    // - ENDINGS ---------------------------- *

    endZetaDiaries: function () {

        return { nextSeries: 'end', nextEpisode: 'episode6' };
    },
    endThetaDiaries: function () {

        return { nextSeries: 'end', nextEpisode: 'episode6'  };
    },
    endZetaTR: function () {

        return { nextSeries: 'end', nextEpisode: 'episode6'  };
    },
    endThetaTR: function () {

        return { nextSeries: 'end', nextEpisode: 'episode6'  };
    },

    endZetaMoll: function () {

        return { nextSeries: 'end', nextEpisode: 'episode6'  };
    },
    endThetaMoll: function () {

        return { nextSeries: 'end', nextEpisode: 'episode6'  };
    },
    endThetaCake: function () {

        return { nextSeries: 'end', nextEpisode: 'episode6'  };
    },
    endZetaCake: function () {

        return { nextSeries: 'end', nextEpisode: 'episode6'  };
    }
};
