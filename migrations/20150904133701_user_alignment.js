exports.up = function (knex) {

    return knex.schema.table('users', function (users) {

        users.text('alignment').defaultTo('clotho');
    });

};

exports.down = function (knex) {

    return knex.schema.table('users', function (users) {

        users.dropColumn('alignment');
    });
};
