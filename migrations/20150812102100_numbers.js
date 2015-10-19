
exports.up = function (knex, Promise) {

    return knex.schema.createTable('numbers', function (numbers) {

        numbers.increments('id').notNullable().primary();
        numbers.boolean('international').defaultTo(false);
        numbers.text('lachesis');
        numbers.text('atropos');
        numbers.text('clotho');
    }).then(function () {

        return Promise.join(
            knex('numbers').insert({
                lachesis: '15092625352',
                atropos: '15092625364',
                clotho: '15095931043'
            }),
            knex('numbers').insert({
                lachesis: '15095931047',
                atropos: '15095931050',
                clotho: '15095931052'
            })
        );
    });

};

exports.down = function (knex) {

    return knex.schema.dropTableIfExists('numbers');
};
