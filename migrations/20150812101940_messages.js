
exports.up = function (knex) {

    return knex.schema.createTable('messages', function (messages) {

        messages.increments('id').notNullable().primary();
        messages.text('content').notNullable();
        messages.integer('series_id').references('series.id').index();
        messages.integer('wait').defaultTo(0);
        messages.integer('series_seq').notNullable();
    });
};

exports.down = function (knex) {

    return knex.schema.dropTableIfExists('messages');
};
