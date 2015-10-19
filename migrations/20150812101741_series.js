
exports.up = function (knex) {

    return knex.schema.createTable('series', function (series) {

        series.increments('id').notNullable().primary();
        series.text('name').unique();
        series.integer('episode_id').references('episodes.id');
        series.text('possible_successors');
        series.specificType('valid_options', 'text[]');
        series.boolean('start').defaultTo(false);
        series.boolean('end').defaultTo(false);
        series.integer('cohort_id').references('cohorts.id');
    });
};

exports.down = function (knex) {

    return knex.schema.dropTableIfExists('series');
};
