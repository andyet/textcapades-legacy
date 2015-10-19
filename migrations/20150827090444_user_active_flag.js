exports.up = function (knex, Promise) {

    return knex.schema.table('users', function (users) {

        users.boolean('active').notNullable().defaultTo(false);
    });
};

exports.down = function (knex, Promise) {

    return knex.schema.table('users', function (users) {

        users.dropColumn('active');
    });
};
