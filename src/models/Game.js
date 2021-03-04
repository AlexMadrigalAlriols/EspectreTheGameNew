const mongoose = require('mongoose');
const { Schema } = mongoose;

const GameSchema = new Schema({
    name: {type: String },
    code: { type: String},
    players: { type: Array },
    periodico: { type: String, default: 'PeriodicoDefault.png'},
    mapa: { type: String, default: '/img/background-hero.png'},
    year: { type: Number, default: 1800 },
    linkmeet: {type: String, default: '/ingame/nolink'},
    events: { type: Array },
    groups: { type: Array },
    practicasSubidas: {type: Number, default: 0 },
    actividadActual: { type: String },
    admin: {type: String },
    classtag: {type: String}
});

module.exports = mongoose.model('Game', GameSchema);