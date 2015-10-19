
exports.up = function (knex) {

    return knex.schema.table('users', function (users) {

        users.text('slack_username');
    });
};

exports.down = function (knex) {

    return knex.schema.table('users', function (users) {

        users.dropColumn('slack_username');
    });
};
