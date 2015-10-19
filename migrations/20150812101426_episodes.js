exports.up = function (knex) {

    return knex.schema.createTable('episodes', function (episodes) {

        episodes.increments('id').notNullable().primary();
        episodes.text('title').notNullable().unique();
        episodes.text('from_character');
    });
};

exports.down = function (knex) {

    return knex.schema.dropTableIfExists('episodes');
};
