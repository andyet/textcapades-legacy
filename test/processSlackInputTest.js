/*global it, describe, before */
/*jshint -W030 */
var chai = require('chai');
var expect = chai.expect;
var config = require('getconfig');
var knex = require('knex')(config.db);
var Promise = require('bluebird');
var models = require('../messaging/accessModels');
var processInput = require('../slack/processSlackInput');
var arrayEqual = require('../messaging/utils/arrayUtils').arrayEqual;

var fetchUnsentMessages = function fetchUnsentMessages (qb) {

    qb.where({
        message_type: 'send',
        sent: false
    });

};
var sendMessages = function sendMessages (test) {

    // receive input as user
    return processInput(test.userPhone, null, null, test.input).then(function (user) {

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
describe('processSlackInput returns the correct message array', function () {

    // clear database after testing receive to get rid of garbage data
    before(function (done) {

        return Promise.all([knex('history').del()]).then(function () {

            return knex('users').del();
        }).then(function () {

            done();
        });
    });
    var tests = [
        // Seed new user from 'Start' with no specified template
        {
            input: 'Start decisionTest',
            userPhone: '1',
            messageReponse: [
                '[Connection verify]: Fail',
                '[Retry? Y/N]:'
            ]
        },
        // Fetch existing user and send valid response to server
        {
            input: 'Y',
            userPhone: '1',
            messageReponse: [
                '[Connection verify]: Success',
                'Woo hoo! Love that ol\' connection verify message. Am I coming through loud and clear?'
            ]
        },
        // Send invalid response, response with error template
        {
            input: 'foo',
            userPhone: '1',
            messageReponse: ['I didn\'t understand you. You can choose from y, n']
        },
        // // continue with story after error
        {
            input: 'N',
            userPhone: '1',
            messageReponse: [
                'Dang. Hang on, let me adjust the gain on this here antenna. One sec.',
                'Ah okay. Here we go.',
                '[Terminus handshake initiated, run script \u201CHello, User!]:',
                'Damn it all, hang on. I almost have it.',
                'Hello, User, and welcome to your Aiden Spencer Unlimited Terminus VI,',
                '[Signal interrupt]',
                'New features include remote Feed sensor, haptic interface, and buckyball memory sys-',
                '[Rerouting\u2026]',
                '[Rerout]: Fail',
                'Seriously. Once sec. Just ignore the computer freaking out for like...ugh...this thing.',
                'Can you do me a favor from your end? Just type \u201CTerminal unlock: authorization M.Driver zero one."'
            ]
        },
        // Start existing user from new template
        {
            input: 'Start decisionTest relief',
            userPhone: '1',
            messageReponse: ['Anyway, your story checks out. It looks like you\u2019re you. Isn\u2019t that a relief?']
        },
        // Send invalid response, response with error template
        {
            input: 'foo',
            userPhone: '1',
            messageReponse: ['I didn\'t understand you. You can choose from y, n']
        },
        // Start existing user from new template after error
        {
            input: 'Start decisionTest relief',
            userPhone: '1',
            messageReponse: ['Anyway, your story checks out. It looks like you\u2019re you. Isn\u2019t that a relief?']
        },
        // // Seed new user with a specified template
        {
            input: 'Start decisionTest relief',
            userPhone: '2',
            messageReponse: ['Anyway, your story checks out. It looks like you\u2019re you. Isn\u2019t that a relief?']
        }, {
            input: 'Start decisionTest askTerritory',
            userPhone: '3',
            messageReponse: ['Okay, and just for verification purposes, are you from the State of Play, Arthaus, The Writers\u2019 Bloc, or the Tech Republic?']
        }, {
            input: 'Arthaus',
            userPhone: '3',
            messageReponse: [
                'Ah, jeez. Yeah, of course you are. I just...let\u2019s move on.',
                'Anyway, your story checks out. It looks like you\u2019re you. Isn\u2019t that a relief?'
            ]
        }, {
            input: 'Start decisionTest askTerritory',
            userPhone: '4',
            messageReponse: ['Okay, and just for verification purposes, are you from the State of Play, Arthaus, The Writers\u2019 Bloc, or the Tech Republic?']
        }, {
            input: 'writers\u2019 bloc',
            userPhone: '4',
            messageReponse: [
                'Your story checks out. And uh...listen. I know a lot of folks around the Tech Republic have a problem with Writers these days. But I want to let you know that I\u2019m not one of them.',
                'It\u2019s weird how that happens, though, isn\u2019t it?',
                'I mean, twenty years ago everyone had this big grudge against the TR, and calling us Makers and Tinkerers and stuff was an okay thing to do. Like it wasn\u2019t a total insult.',
                'And now, folks are doing the same thing to you guys. And to be frank, I think it\u2019s bullshit.',
                'Anyway, I just wanted to get that out of the way. *I* think you\u2019re cool, and I just happen to be the coolest person of ever.',
                'Giving someone a hard time because they were born in a different place than you? How does that make sense?',
                'So by proxy that makes you at leeeeeeast...medium cool.',
                'Anyway, your story checks out. It looks like you\u2019re you. Isn\u2019t that a relief?'
            ]
        }
    ];
    tests.forEach(function (test) {

        it('response for user ' + test.userPhone + ' and input ' + test.input + ' is correct', function (done) {

            return sendMessages(test).then(function (messages) {

                var arraysAreEqual = arrayEqual(messages, test.messageReponse);
                expect(arraysAreEqual).to.be.true;
                done();
            });
        });
    });
});
describe('processSlackInput returns with seeded data', function () {

    // clear database after testing receive to get rid of garbage data
    before(function (done) {

        knex('history').del().then(function () {

            return knex('users').del();
        }).then(function () {

            done();
        });
    });
    var tests = [
        // Seed new user from 'Start' with no specified template
        {
            input: 'yes',
            userBlob: {
                phone: '1',
                decision_blob: {
                    episodeTitle: 'decisionTest',
                    seriesName: 'seeName',
                    validOptions: [
                        'y',
                        'n'
                    ]
                },
                next_series_name: 'seeName',
                answerBlob: {
                    'askTerritory': 'arthaus'
                }
            },
            userPhone: '1',
            messageReponse: [
                'Well there you go.',
                'Point is, Aidan didn\u2019t get to where he was by frittering the day away playing croquet or water polo or horse polo or seahorse polo or whatever',
                'Instead, Aidan went out and created a security blanket.',
                'A nice, soft place for humanity to wrap itself up when the light went out...',
                '...and the monster creeped out from under the bed on soft, flobbering feet and dragging sickle claws.',
                'Because the monsters did come, didn\u2019t they?',
                'But Aidan\u2019s plan came just a couple decades too late. SILOS swept in and smashed everything flat.',
                'We all suffered, but your people got it worse than anybody, didn\u2019t they?',
                'For what it\u2019s worth (and I know it\u2019s not worth much, not at this late hour), well...',
                '...I\u2019m sorry. I\u2019m just so damned sorry. Maybe if we had done more earlier on, maybe if we had paid a little more attention when SILOS first attacked you...',
                'Anyway, what happened, happened.',
                'I dunno. Maybe things would have come out different. Maybe we wouldn\u2019t be here, wading around in the ashes of the world, trying to figure out what to do next.',
                'But anyway.',
                'Word has it that someone...',
                '(and your guess is as good as mine as to who)',
                '...has dug up Aidan Spencer\u2019s old plans and started making his dream a reality.',
                'Which is where you come in.',
                'You see, I\u2019ve been keeping an eye on this whole RichLand thing. Not because I\u2019m suspicious of what\u2019s going on there!',
                'But living in this world has taught me to go forward with an abundance of caution.',
                'Go figure that living in a post-apocalyptic nightmare has sharpened my sense of danger.',
                'The little hairs on the back of my neck are standing up straight, which means it\u2019s time for me to sign off. I do have one last question for you, though.',
                'In fact, we\u2019ve been on this Feed channel just a little too long.',
                'Looking around at the world, knowing what it once was, knowing what it had the potential to become...would you rebuild it as it was?'
            ]
        }, {
            input: 'Heather',
            userBlob: {
                phone: '2',
                name: 'heather',
                rtc_name: 'preethna',
                decision_blob: {
                    episodeTitle: 'decisionTest',
                    seriesName: 'askName',
                    validOptions: [
                        'heather',
                        'preethna',
                        'default'
                    ]
                },
                next_series_name: 'askName'
            },
            userPhone: '2',
            messageReponse: [
                'Whew. Thank goodness. Can you imagine if I went through all that trouble to contact you and you turned out to be the wrong person?',
                '\u201CGee, sorry I hacked your terminus remotely and implied that you may or may not have some larger role in the salvation of humanity...',
                '"...so please, go right back to watching your kinoshows and arguing politics on social media.\u201D How embarrassing.',
                'Okay, and just for verification purposes, are you from the State of Play, Arthaus, The Writers\u2019 Bloc, or the Tech Republic?'
            ]
        }, {
            input: 'Preethna',
            userBlob: {
                phone: '3',
                name: 'heather',
                rtc_name: 'preethna',
                decisionBlob: {
                    episodeTitle: 'decisionTest',
                    seriesName: 'askName',
                    validOptions: [
                        'heather',
                        'preethna',
                        'default'
                    ]
                },
                next_series_name: 'askName'
            },
            userPhone: '3',
            messageReponse: [
                'Oh hey. It IS you! Man, am I ever relieved. Believe it or not, some folks are starting to forget what happened to us way back when.',
                'I dunno if it was SILOS that done it or what, but the memories of that day...of Ros and Gregor and Moses and all that stuff that happened...it\u2019s like it\u2019s fading away.',
                'But YOU remember, and that might just be enough to save us.',
                'Okay, and just for verification purposes, are you from the State of Play, Arthaus, The Writers\u2019 Bloc, or the Tech Republic?'
            ]
        }
    ];
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
