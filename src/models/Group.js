const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupSchema = new Schema({
    name: { type: String},
    users: {type: Array },
    oro:   {type: Number, default: 0},
    inteligencia: { type: Number, default: 0},
    construccion: { type: Number, default: 0},
    diamantes: { type: Number, default: 0},
    cartas: {type: Array },
    Ataqued: { type: Boolean, default: false},
    TierOfAttacked: {type: String},
    practica: { type: String },
    subido: { type: Boolean, default: false},
    notaFinal: {type: Number, default: 0},
    game: { type: String},
    nota: { type: Number, default: 0},
    comentarios: { type: String },
    notas: { type: Array }
});

module.exports = mongoose.model('Group', GroupSchema);