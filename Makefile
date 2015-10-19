test: drop-and-migrate-test
	@NODE_ENV=test node node_modules/.bin/mocha

migrate-latest:
	@npm run-script knex -- migrate:latest

migrate-latest-test:
	@NODE_ENV=test npm run-script knex -- migrate:latest

drop-and-migrate:
	@echo resetting database: $(shell node -pe "require('getconfig').db.connection.database")
	@dropdb $(shell node -pe "require('getconfig').db.connection.database") --if-exists
	@createdb $(shell node -pe "require('getconfig').db.connection.database") -O textcapade
	@psql $(shell node -pe "require('getconfig').db.connection.database") -c 'CREATE EXTENSION "uuid-ossp"'
	@npm run-script knex -- migrate:latest

drop-and-migrate-test:
	@dropdb textcapade_test --if-exists
	@createdb textcapade_test -O textcapade
	@psql textcapade_test -c 'CREATE EXTENSION "uuid-ossp"'
	@NODE_ENV=test npm run-script knex -- migrate:latest

seed:
	@npm run knex seed:run

.PHONY: test drop-and-migrate drop-and-migrate-test migrate-latest migrate-latest-test
