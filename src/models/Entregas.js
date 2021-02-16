const mongoose = require('mongoose');
const { Schema } = mongoose;

const EntregasSchema = new Schema({
    user: { type: String },
    group: { type: String },
    nota: { type: String, default: "Sin Calificar" },
    actividad: { type: String },
    comentarios: { type: String },
    actividadname: {type: String },
    entrega: {type: String }
});

module.exports = mongoose.model('Entregas', EntregasSchema);