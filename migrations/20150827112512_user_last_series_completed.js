exports.up = function (knex, Promise) {

    return knex.schema.table('users', function (users) {

        users.dateTime('last_series_completed');
    });
};

exports.down = function (knex, Promise) {

    return knex.schema.table('users', function (users) {

        users.dropColumn('last_series_completed');
    });
};
