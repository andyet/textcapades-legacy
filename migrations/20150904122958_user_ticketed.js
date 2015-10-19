
exports.up = function (knex) {

    return knex.schema.table('users', function (users) {

        users.boolean('ticketed').defaultTo(false);
    });

};

exports.down = function (knex) {

    return knex.schema.table('users', function (users) {

        users.dropColumn('ticketed');
    });
};
