
exports.up = function (knex) {

    return knex.schema.createTable('history', function (history) {

        history.increments('id').notNullable().primary();
        history.integer('user_id').references('users.id').index();
        history.text('message_type').notNullable();
        history.text('from_character');
        history.text('from_phone');
        history.boolean('sent').defaultTo(false);
        history.text('message');
        history.integer('time');
        history.integer('seq').defaultTo(0);
    });
};

exports.down = function (knex) {

    return knex.schema.dropTableIfExists('history');
};
