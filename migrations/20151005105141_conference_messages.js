
exports.up = function (knex) {

    return knex.schema.createTable('conferencemessages', function (conferencemessages) {

        conferencemessages.increments('id').notNullable().primary();
        conferencemessages.text('from_character');
        conferencemessages.text('content');
        conferencemessages.datetime('time');
    });
};

exports.down = function (knex) {

    return knex.schema.dropTableIfExists('conferencemessages');
};
