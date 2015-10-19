exports.up = function (knex) {

    return knex('numbers').insert({
        international: true,
        lachesis: '14038009525',
        atropos: '15874876243',
        clotho: '14038009526'
    });
};

exports.down = function (knex) {

    return knex('numbers').where({
        lachesis: '14038009525'
    }).del();

};
