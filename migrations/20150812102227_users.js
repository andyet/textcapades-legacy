exports.up = function (knex) {

    return knex.schema.createTable('users', function (users) {

        users.increments('id').notNullable().primary();
        users.text('name');
        users.text('rtc_name');
        users.text('email');
        users.text('phone');
        users.json('decision_blob');
        users.json('answer_blob');
        users.uuid('validate_key').notNullable().defaultTo(knex.raw('uuid_generate_v4()'));
        users.boolean('ready_to_receive').notNullable().defaultTo(true);
        users.boolean('validated').notNullable().defaultTo(false);
        users.integer('next_series_id').references('series.id');
        users.integer('last_series_id').references('series.id');
        users.integer('episode_id').references('episodes.id');
        users.integer('territory_id').references('territories.id');
        users.integer('cohort_id').references('cohorts.id');
        users.integer('number_id').references('numbers.id');
    });
};

exports.down = function (knex) {

    return knex.schema.dropTableIfExists('users');
};
