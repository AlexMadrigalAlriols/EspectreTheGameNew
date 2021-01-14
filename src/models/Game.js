const mongoose = require('mongoose');
const { Schema } = mongoose;

const GameSchema = new Schema({
    code: { type: String},
    players: { type: Array },
    periodico: { type: String, default: 'PeriodicoDefault.png'},
    mapa: { type: String, default: '/img/background-hero.png'},
    year: { type: Number, default: 1800 },
    events: { type: Array },
    practicasSubidas: {type: Number, default: 0 }
});

module.exports = mongoose.model('Game', GameSchema);