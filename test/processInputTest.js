/*global it, describe, before */
/*jshint -W030 */

var chai = require('chai');
var expect = chai.expect;
var config = require('getconfig');
var knex = require('knex')(config.db);
var Promise = require('bluebird');

var models = require('../messaging/accessModels');
var processInput = require('../messaging/processInput');
var arrayEqual = require('../messaging/utils/arrayUtils').arrayEqual;


var fetchUnsentMessages = function fetchUnsentMessages (qb) {

    qb.where({ message_type: 'send', sent: false });
};

var sendMessages = function sendMessages (test) {

    // receive input as user
    return processInput(test.userPhone, test.isStarting, test.input, test.seriesName).then(function (user) {

        return user.related('history').query(fetchUnsentMessages).fetch().then(function (histories) {

            histories.comparator = 'id';
            histories.sort();
            return Promise.map(histories.models, function (model) {

                return model.set('sent', true).save().then(function () {

                    return model.get('message');
                });
            });
        });
    });
};

describe('processInput returns the correct message array', function () {

    // clear database before testing receive to get rid of garbage data
    before(function (done) {

        return Promise.all([
            knex('history').del()
        ]).then(function () {

            return knex('users').del();
        }).then(function () {

            done();
        });
    });
    var tests = [{
        input: 'decisionTest',
        isStarting: true,
        userPhone: 'phone1',
        messageReponse: ['[Connection verify]: Fail', '[Retry? Y/N]:']
    }, {
        // Fetch existing user and send valid response to server
        input: 'Y',
        userPhone: 'phone1',
        isStarting: false,
        messageReponse: [
            '[Connection verify]: Success',
            'Woo hoo! Love that ol\' connection verify message. Am I coming through loud and clear?'
        ]
    }, {
        // // Send invalid response, response with error template
        input: 'foo',
        userPhone: 'phone1',
        isStarting: false,
        messageReponse: ['I didn\'t understand you. You can choose from y, n']
    }, {
        input: 'asdf',
        userPhone: 'phone1',
        isStarting: false,
        messageReponse: ['I didn\'t understand you. You can choose from y, n']
    }, {
        // continue with story after error
        input: 'N',
        userPhone: 'phone1',
        isStarting: false,
        messageReponse: ['Dang. Hang on, let me adjust the gain on this here antenna. One sec.',
            'Ah okay. Here we go.',
            '[Terminus handshake initiated, run script “Hello, User!]:',
            'Hello, User, and welcome to your Aiden Spencer Unlimited Terminus VI,',
            'New features include remote Feed sensor, haptic interface, and buckyball memory sys-',
            '[Signal interrupt]',
            'Damn it all, hang on. I almost have it.',
            '[Rerouting…]',
            '[Rerout]: Fail',
            'Seriously. Once sec. Just ignore the computer freaking out for like...ugh...this thing.',
            'Can you do me a favor from your end? Just type “Terminal unlock: authorization M.Driver zero one."'
        ]
    }, {
        // Start existing user from new series
        input: 'decisionTest',
        userPhone: 'phone1',
        isStarting: true,
        seriesName: 'terminalIsSecure',
        messageReponse: [
            'Okay great! I should have expected nothing less from someone like you. But just to be on the safe side…',
            'There. Connection is as snug as a bug in a rug. So let’s get down to brass tacks. Some serious stuff is going down.',
            'Stuff that might have serious repercussions for the whole human race.',
            '(So, no pressure, right?)',
            'But first, I have to be sure that you’re YOU. Provide me with your bonafides and all.',
            'And since we can’t do the Awesome Post-Apocalyptic Ninja Association handshake on the lines, maybe you could be so kind to share your name with me.',
            'Nothing fancy. Just type in your name.'
        ]
    }, {
        input: 'foo',
        userPhone: 'phone1',
        isStarting: false,
        messageReponse: [
            'Hey...I get it. You don’t trust me yet. That’s cool. It’s been a long time, and you just happen to be one of the ones who forgot what happened back when.',
            'But don\'t worry, the memories will come back. They always do, whether we want them to or not.',
            'Still, is it okay if I just call you null for short?']
    }, {
        // Seed new user with a specified template
        input: 'decisionTest',
        userPhone: 'phone2',
        isStarting: true,
        seriesName: 'relief',
        messageReponse: [
            'Anyway, your story checks out. It looks like you’re you. Isn’t that a relief?'
        ]
    }, {
        input: 'decisionTest',
        userPhone: 'phone3',
        isStarting: true,
        seriesName: 'askTerritory',
        userEmail: 'processUser3',
        messageReponse: ['Okay, and just for verification purposes, are you from the State of Play, Arthaus, The Writers’ Bloc, or the Tech Republic?']
    }, {
        input: 'Arthaus',
        userPhone: 'phone3',
        userEmail: 'processUser3',
        messageReponse: [
            'Ah, jeez. Yeah, of course you are. I just...let’s move on.',
            'Anyway, your story checks out. It looks like you’re you. Isn’t that a relief?'
        ]
    }, {
        input: 'decisionTest',
        userPhone: 'phone4',
        isStarting: true,
        seriesName: 'askTerritory',
        userEmail: 'processUser4',
        messageReponse: ['Okay, and just for verification purposes, are you from the State of Play, Arthaus, The Writers’ Bloc, or the Tech Republic?']
    }, {
        input: 'writers’ bloc',
        userPhone: 'phone4',
        isStarting: false,
        messageReponse: [
            'Your story checks out. And uh...listen. I know a lot of folks around the Tech Republic have a problem with Writers these days. But I want to let you know that I’m not one of them.',
            'It’s weird how that happens, though, isn’t it?',
            'I mean, twenty years ago everyone had this big grudge against the TR, and calling us Makers and Tinkerers and stuff was an okay thing to do. Like it wasn’t a total insult.',
            'And now, folks are doing the same thing to you guys. And to be frank, I think it’s bullshit.',
            'Giving someone a hard time because they were born in a different place than you? How does that make sense?',
            'Anyway, I just wanted to get that out of the way. *I* think you’re cool, and I just happen to be the coolest person of ever.',
            'So by proxy that makes you at leeeeeeast...medium cool.',
            'Anyway, your story checks out. It looks like you’re you. Isn’t that a relief?']
    }];

    tests.forEach(function (test) {

        it('response for user ' + test.userPhone + ' and input ' + test.input + ' is correct', function (done) {

            return sendMessages(test).then(function (messages) {

                // console.log('test', messages);
                var arraysAreEqual = arrayEqual(messages, test.messageReponse);
                expect(arraysAreEqual).to.be.true;
                done();
            });
        });
    });
});


describe('processInput returns with seeded data', function () {

    // clear database after testing receive to get rid of garbage data
    before(function (done) {

        return Promise.all([
            knex('history').del()
        ]).then(function () {

            return knex('users').del();
        }).then(function () {

            done();
        });
    });


    var tests = [{
        // Seed new user from 'Start' with no specified template
        input: 'Yes I do, and some vegetables',
        userBlob: {
            phone: '1',
            next_series_name: 'seeName',
            decision_blob: {
                episodeTitle: 'decisionTest',
                seriesName: 'seeName',
                validOptions: ['y', 'n']
            },
            answer_blob: {
                'askTerritory': 'arthaus'
            }
        },
        userPhone: '1',
        isStarting: false,
        messageReponse: ['Well there you go.',
            'Point is, Aidan didn’t get to where he was by frittering the day away playing croquet or water polo or horse polo or seahorse polo or whatever',
            'Instead, Aidan went out and created a security blanket.',
            'A nice, soft place for humanity to wrap itself up when the light went out...',
            '...and the monster creeped out from under the bed on soft, flobbering feet and dragging sickle claws.',
            'But Aidan’s plan came just a couple decades too late. SILOS swept in and smashed everything flat.',
            'We all suffered, but your people got it worse than anybody, didn’t they?',
            'For what it’s worth (and I know it’s not worth much, not at this late hour), well...',
            '...I’m sorry. I’m just so damned sorry. Maybe if we had done more earlier on, maybe if we had paid a little more attention when SILOS first attacked you...',
            'Because the monsters did come, didn’t they?',
            'I dunno. Maybe things would have come out different. Maybe we wouldn’t be here, wading around in the ashes of the world, trying to figure out what to do next.',
            'Anyway, what happened, happened.',
            'But anyway.',
            'Word has it that someone...',
            '(and your guess is as good as mine as to who)',
            '...has dug up Aidan Spencer’s old plans and started making his dream a reality.',
            'Which is where you come in.',
            'You see, I’ve been keeping an eye on this whole RichLand thing. Not because I’m suspicious of what’s going on there!',
            'But living in this world has taught me to go forward with an abundance of caution.',
            'Go figure that living in a post-apocalyptic nightmare has sharpened my sense of danger.',
            'In fact, we’ve been on this Feed channel just a little too long.',
            'The little hairs on the back of my neck are standing up straight, which means it’s time for me to sign off. I do have one last question for you, though.',
            'Looking around at the world, knowing what it once was, knowing what it had the potential to become...would you rebuild it as it was?']
    }, {
        input: 'Heather',
        userBlob: {
            phone: '2',
            name: 'heather',
            rtc_name: 'preethna',
            decision_blob: {
                episodeTitle: 'decisionTest',
                seriesName: 'askName',
                validOptions: ['heather', 'preethna', 'default']
            },
            next_series_name: 'askName'
        },
        userPhone: '2',
        isStarting: false,
        messageReponse: ['Whew. Thank goodness. Can you imagine if I went through all that trouble to contact you and you turned out to be the wrong person?',
            '“Gee, sorry I hacked your terminus remotely and implied that you may or may not have some larger role in the salvation of humanity...',
            '"...so please, go right back to watching your kinoshows and arguing politics on social media.” How embarrassing.',
            'Okay, and just for verification purposes, are you from the State of Play, Arthaus, The Writers’ Bloc, or the Tech Republic?']
    }, {
        input: 'Preethna',
        userBlob: {
            phone: '3',
            name: 'heather',
            rtc_name: 'preethna',
            decisionBlob: {
                episodeTitle: 'decisionTest',
                seriesName: 'askName',
                validOptions: ['heather', 'preethna', 'default']
            },
            next_series_name: 'askName'
        },
        userPhone: '3',
        isStarting: false,
        messageReponse: ['Oh hey. It IS you! Man, am I ever relieved. Believe it or not, some folks are starting to forget what happened to us way back when.',
            'I dunno if it was SILOS that done it or what, but the memories of that day...of Ros and Gregor and Moses and all that stuff that happened...it’s like it’s fading away.',
            'But YOU remember, and that might just be enough to save us.',
            'Okay, and just for verification purposes, are you from the State of Play, Arthaus, The Writers’ Bloc, or the Tech Republic?']
    }, {
        input: 'Terminal unlock: authorization M.Driver zero one.',
        userBlob: {
            phone: '4',
            decisionBlob: {
                episodeTitle: 'decisionTest',
                seriesName: 'terminalUnlock',
                validOptions: ['Terminal unlock: authorization M.Driver zero one.', 'default']
            },
            next_series_name: 'terminalUnlock'
        },
        userPhone: '4',
        isStarting: false,
        messageReponse: ['Awesome! That should do it.',
            '[Connection ver-]',
            'Yes, jeez, we got it already! Connection verify fail. Cheesy Pete, do they ever change the script on these things?',
            'I mean, would it be so hard to just have them be like “Oh dang, something done got fucked up now.”',
            '[Unauthorized user detected. Attempting purge.]',
            'Now we’re talking! That’s some high-quality rogue AI type of stuff. “Attempting purge!”',
            'I can just see some glimmering monstrosity stomping across a carpet of bones, blasting lasers every whichway and carrying on about “purge this” and “assimilate that.”',
            '[Purge commencing, please stand by.]',
            'Yeah, no thanks. We’re far too busy to wait around for that kind of thing. Because it’s half-past the end of the world and we got a lot of work to do, you know?',
            '[Purge-]',
            'But I promise to take you out for ice cream and the subjugation of the human race tomorrow after the father/son/inane robotic intelligence softball game, mmmkay?',
            'Jiminy. Okay, sorry. I’ll shut this guy off. Sorry, fella. No purging today.',
            '[ERROR, MEMORY CORE FAULT]',
            'There it is.',
            'Okay. Now we can talk in peace. Assuming, of course, that no one else is listening in. So I gotta ask you...is this terminal secure?']
    }, {
        input: 'blarg',
        userBlob: {
            phone: '5',
            decisionBlob: {
                episodeTitle: 'decisionTest',
                seriesName: 'terminalUnlock',
                validOptions: ['Terminal unlock: authorization M.Driver zero one.', 'default']
            },
            next_series_name: 'terminalUnlock'
        },
        userPhone: '5',
        isStarting: false,
        messageReponse: ['[Connection ver-]',
            'Dang it. Okay, don’t worry about it. I wouldn’t trust me either. Not yet. Just stand by one sec and I’ll get this sorted myself.',
            'Yes, jeez, we got it already! Connection verify fail. Cheesy Pete, do they ever change the script on these things?',
            'I mean, would it be so hard to just have them be like “Oh dang, something done got fucked up now.”',
            '[Unauthorized user detected. Attempting purge.]',
            'Now we’re talking! That’s some high-quality rogue AI type of stuff. “Attempting purge!”',
            'I can just see some glimmering monstrosity stomping across a carpet of bones, blasting lasers every whichway and carrying on about “purge this” and “assimilate that.”',
            '[Purge commencing, please stand by.]',
            'Yeah, no thanks. We’re far too busy to wait around for that kind of thing. Because it’s half-past the end of the world and we got a lot of work to do, you know?',
            '[Purge-]',
            'But I promise to take you out for ice cream and the subjugation of the human race tomorrow after the father/son/inane robotic intelligence softball game, mmmkay?',
            'Jiminy. Okay, sorry. I’ll shut this guy off. Sorry, fella. No purging today.',
            '[ERROR, MEMORY CORE FAULT]',
            'There it is.',
            'Okay. Now we can talk in peace. Assuming, of course, that no one else is listening in. So I gotta ask you...is this terminal secure?']
    }, {
        input: 'blarg',
        userBlob: {
            phone: '6',
            next_series_name: 'whatsYourIdea',
            decision_blob: {
                episodeTitle: 'decisionTest',
                seriesName: 'whatsYourIdea',
                validOptions: ['aidan spencer', 'i don\'t know', 'i don’t know', 'default']
            }
        },
        userPhone: '6',
        isStarting: false,
        messageReponse: [
            'Whoa, that’s an interesting theory. I’m gonna have to keep that one in my back pocket. ',
            'I mean, it could be absolutely anybody when you get right down to it. But the kind of person who would send some hired goons and a mecha?',
            'That person has to have serious scratch.',
            'Only one problem: he’s dead. And even the super-rich have to die eventually, right?',
            'Right?',
            'I did a little background on him. Dug up some details on his family history. Not sure if it’ll help, but anything might at this point. ',
            'Do you want to see what I found? '
        ]
    }, {
        input: 'heather',
        userBlob: {
            name: 'heather',
            rtc_name: 'preethna',
            phone: '7',
            next_series_name: 'askName'
        },
        userPhone: '7',
        isStarting: false,
        messageReponse: [
            'Whew. Thank goodness. Can you imagine if I went through all that trouble to contact you and you turned out to be the wrong person?',
            '“Gee, sorry I hacked your terminus remotely and implied that you may or may not have some larger role in the salvation of humanity...',
            '"...so please, go right back to watching your kinoshows and arguing politics on social media.” How embarrassing.',
            'Okay, and just for verification purposes, are you from the State of Play, Arthaus, The Writers’ Bloc, or the Tech Republic?']

    }, {
        input: 'pirate',
        userBlob: {
            name: 'heather',
            rtc_name: 'preethna',
            phone: '8',
            next_series_name: 'askName'
        },
        userPhone: '8',
        isStarting: false,
        messageReponse: [
            'Hey...I get it. You don’t trust me yet. That’s cool. It’s been a long time, and you just happen to be one of the ones who forgot what happened back when.',
            'But don\'t worry, the memories will come back. They always do, whether we want them to or not.',
            'Still, is it okay if I just call you heather for short?'
        ]
    }];

    tests.forEach(function (test) {

        it('response for user ' + test.userPhone + ' and input ' + test.input + ' is correct', function (done) {

            models.getUser(test.userBlob).then(function () {

                return sendMessages(test).then(function (messages) {

                    var arraysAreEqual = arrayEqual(messages, test.messageReponse);
                    expect(arraysAreEqual).to.be.true;
                    done();
                });
            });
        });
    });
});
