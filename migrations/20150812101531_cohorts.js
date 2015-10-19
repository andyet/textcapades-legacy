
exports.up = function (knex, Promise) {

    return knex.schema. createTable('cohorts', function (cohorts) {

        cohorts.increments('id').notNullable().primary();
        cohorts.text('name').notNullable().unique();
    }).then(function () {

        return Promise.join(
            knex('cohorts').insert({ name: 'alpha' }),
            knex('cohorts').insert({ name: 'beta' }),
            knex('cohorts').insert({ name: 'gamma' }),
            knex('cohorts').insert({ name: 'zeta' }),
            knex('cohorts').insert({ name: 'theta' }),
            knex('cohorts').insert({ name: 'epsilon' }),
            knex('cohorts').insert({ name: 'rho' })
        );
    });
};

exports.down = function (knex) {

    return knex.schema.dropTableIfExists('cohorts');
};
