
exports.up = function (knex, Promise) {

    return knex.schema. createTable('territories', function (territories) {

        territories.increments('id').notNullable().primary();
        territories.text('name').notNullable().unique();
    }).then(function () {

        return Promise.join(
            knex('territories').insert({ name: 'stateOfPlay' }),
            knex('territories').insert({ name: 'writersBloc' }),
            knex('territories').insert({ name: 'techRepublic' }),
            knex('territories').insert({ name: 'arthaus' })
        );
    });
};

exports.down = function (knex) {

    return knex.schema.dropTableIfExists('territories');
};
