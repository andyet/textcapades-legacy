# Textcapade

### Overview

Textcapade is Create Your Own Adventure game.

## Server

If you don't have postgresql installed, you will need it. homebrew is
the easiest way

```shell
brew install postgresql
```

Create the database user
```shell
$ createuser -w -l textcapade
```

Initialize database

```shell
$ make drop-and-migrate
```

Generate an episode or three from the jade source

```
$ npm run buildEpisode episode1
$ npm run buildEpisode episode2-a

(Rebuilding an episode is destructive and thus will fail if any users
are currently in that episode)

Set up local dev data (optional)

```shell
$ npm run knex seed:run
```

Run the dummy tropo server
```shell
$ npm run dummy
```

Run Hapi server at `localhost:8000` with
```shell
$ npm start
```

Logging is done via the debug module under namespade `textcapade`
So set `DEBUG='textcapade'` at the console to show logging

## Playing

* Open a browser to localhost:8000
* Add a user, click the user, validate the user (or let them via email), then click start episode.
* Go to Author to run a story as that user

## Story Flow

Messages sent to the user are derived from Jade templates in the story/ directory
At a **fork** in the tree users must make a **decision**. The game determines the
next file by running a decision function stored in the decisions/ directory.

## Testing
  * run all mocha tests `npm run test`

## Components

  * Postgres Database
  * Hapi Server
  * Jade templates
  * Mocha Testing Framework
  * Bookshelf/Knex ORM


## Dummy Server

You can play using a dummy server when running locally, to set it up:

1. `make drop-and-migrate`
2. `npm run buildEpisode episode1`
3. `npm run dummy` in one terminal and `npm start` in another
4. Create a user, and validate with the number: "18005555555"
5. Start the game, you can type in the dummy server terminal and hit return to reply.
