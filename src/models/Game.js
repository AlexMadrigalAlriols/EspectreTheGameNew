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
    classtag: {type: String},
    notes: { type: Boolean, default: true},
    normas: {type: Array },
    castigos: {type: Array},
    norma1: { type: String},
    castigo1: {type: String},
    norma2: {type:String},
    castigo2: { type: String},
    norma3: {type: String},
    castigo3: { type: String},
    norma4: {type: String},
    castigo4: { type: String},
    norma5: {type: String},
    castigo5: { type: String}
});

module.exports = mongoose.model('Game', GameSchema);