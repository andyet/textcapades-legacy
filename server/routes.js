var views = require('./views');
/*
 * Everything under /moderator will be put behing basic http auth
 * by nginx
 */


var routes = [{
    method: 'GET',
    path: '/css/{path}',
    config: {
        handler: { directory: { path: './public/css', listing: false  } }
    }
}, {
    method: 'GET',
    path: '/',
    config: {
        description: 'Main public facing page',
        handler: views.main.index
    }
}, {
    method: 'GET',
    path: '/{phoneNumber}/history',
    config: {
        description: 'Index of user history + hint page',
        handler: views.main.userHistory
    }

}, {
    method: 'GET',
    path: '/slack/{slackUsername}/{episode}',
    config: {
        description: 'Slack user history',
        handler: views.main.userHistory
    }

}, {
    method: 'GET',
    path: '/play',
    config: {
        description: 'Form for people to sign up to play',
        handler: views.main.signupForm
    }
}, {
    method: 'POST',
    path: '/play',
    config: {
        description: 'Destination for sign up form',
        handler: views.main.submitSignup
    }
}, {
    method: 'GET',
    path: '/activate/{validationKey}',
    config: {
        description: 'Form to activate user with given validation key',
        notes: 'Prompts for phone number',
        handler: views.main.activate
    }
}, {
    method: 'GET',
    path: '/activate/{validationKey}/slack',
    config: {
        description: 'Request a Slack invite form',
        handler: views.main.activateSlack
    }
}, {
    method: 'POST',
    path: '/user/{userId}/phone',
    config: {
        description: 'Set phone number as part of validation',
        handler: views.main.setPhone
    }
}, {
    method: 'POST',
    path: '/activate/{validationKey}/slack',
    config: {
        description: 'destination for request a slack invite form',
        handler: views.main.submitSlack
    }
}, {
    method: 'GET',
    path: '/moderator',
    config: {
        description: 'Main moderater page',
        handler: views.moderator.main
    }
}, {
    method: 'GET',
    path: '/moderator/{userId}',
    config: {
        description: 'View single user',
        handler: views.moderator.viewUser
    }
}, {
    method: 'GET',
    path: '/moderator/validation/{userId}',
    config: {
        description: 'Send validation email to single user',
        handler: views.moderator.sendValidationEmail
    }
}, {
    method: 'GET',
    path: '/moderator/edit/{userId}',
    config: {
        description: 'Form to edit single user',
        handler: views.moderator.editUser
    }
}, {
    method: 'POST',
    path: '/moderator/update/{userId}',
    config: {
        description: 'Destination for edit user form',
        handler: views.moderator.updateUser
    }
}, {
    method: 'GET',
    path: '/moderator/template/{userId}',
    config: {
        description: 'Assign template to user',
        handler: views.moderator.assignTemplate
    }
}, {
    method: 'POST',
    path: '/moderator/add-user',
    config: {
        description: 'Create a new user',
        handler: views.moderator.createUser
    }
}, {
    method: 'POST',
    path: '/moderator/users/delete',
    config: {
        description: 'Delete single user',
        handler: views.moderator.deleteUser
    }
}, {
    method: 'GET',
    path: '/moderator/users',
    config: {
        description: 'List all users',
        handler: views.moderator.listUsers
    }
}, {
    method: 'GET',
    path: '/moderator/episodes',
    config: {
        description: 'List all episodes for editing',
        handler: views.episodes.main
    }
}, {
    method: 'GET',
    path: '/moderator/episodes/edit/{episodeId}',
    config: {
        description: 'Form to edit episode',
        handler: views.episodes.edit
    }
}, {
    method: 'POST',
    path: '/moderator/episode/update/{episodeId}',
    config: {
        description: 'Destination for edit episode form',
        handler: views.episodes.update
    }
}, {
    method: 'GET',
    path: '/moderator/states',
    config: {
        description: 'List episodes for viewing states',
        handler: views.states.listEpisodes
    }
}, {
    method: 'GET',
    path: '/moderator/states/{episodeId}',
    config: {
        description: 'List states of given episode',
        handler: views.states.listStates
    }
}, {
    method: 'POST',
    path: '/moderator/bulk',
    config: {
        description: 'Perform actions on a bulk set of users',
        handler: views.moderator.bulkForm
    }
}, {
    method: 'GET',
    path: '/moderator/start/{userId}',
    config: {
        description: 'Start single user in their current episode',
        handler: views.states.startUser
    }
}, {
    method: 'GET',
    path: '/moderator/restart/{userId}',
    config: {
        description: 'Restart an episode for a single user',
        handler: views.states.restartUser
    }
}, {
    method: 'POST',
    path: '/moderator/answer/{userId}',
    config: {
        description: 'Post an answer for a user',
        handler: views.states.answerUser
    }
}, {
    method: 'POST',
    path: '/tropo/callback',
    config: {
        description: 'Callback for texts sent to Tropo numbers',
        handler: views.states.tropoReceive
    }
}, {
    method: 'POST',
    path: '/slack/callback',
    config: {
        description: 'Callback for texts sent to Slack bots',
        handler: views.states.slackReceive
    }
}, {
    method: 'GET',
    path: '/moderator/author',
    config: {
        description: 'Main page for running episode as a user',
        handler: views.author.main
    }
}, {
    method: 'POST',
    path: '/moderator/author/start',
    config: {
        description: 'Choose mocking a series for given user and episode',
        handler: views.author.startEpisode
    }
}, {
    method: 'POST',
    path: '/moderator/author/episode',
    config: {
        description: 'Start running through an episode/series as if you were a user',
        handler: views.author.startSeries
    }
}, {
    method: 'GET',
    path: '/moderator/author/{userId}/episode/{episodeTitle}/{seriesName}/{answers*}',
    config: {
        description: 'Main view for running an episode as a user',
        handler: views.author.getEpisode
    }
}, {
    method: 'POST',
    path: '/moderator/author/{userId}/episode/{episodeTitle}/{seriesName}/{answers*}',
    config: {
        description: 'Form destination for choosing next path while running an episode as a user',
        handler: views.author.getEpisode
    }
}, {
    method: 'GET',
    path: '/moderator/author/story',
    config: {
        description: 'List episodes for editing',
        handler: views.author.editEpisodes
    }
}, {
    method: 'GET',
    path: '/moderator/conference',
    config: {
        description: 'Moderator tools for at the conference',
        handler: views.conference.main
    }
}, {
    method: 'POSt',
    path: '/moderator/conference/sendMessage',
    config: {
        description: 'Send one message to all attendees',
        handler: views.conference.sendMessage
    }
}
];

module.exports = routes;
