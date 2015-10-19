
exports.up = function (knex) {

    return knex.schema.createTable('episodes_cohorts', function (episodesCohorts) {

        episodesCohorts.integer('cohort_id').references('cohorts.id');
        episodesCohorts.integer('episode_id').references('episodes.id');
    });
};

exports.down = function (knex) {

    return knex.schema.dropTableIfExists('episodes_cohorts');
};
