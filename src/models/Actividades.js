const mongoose = require('mongoose');
const { Schema } = mongoose;

const ActividadesSchema = new Schema({
    name: { type: String, required: true },
    descripcion: { type: String },
    recursosAdicionales: { type: String },
    class: { type: String },
    boss: { type: String, default: '/img/bosses/angelcaido.png'},
    individual: { type: Boolean, default: false},
    entregados: {type: Array },
    diamax: { type: Number },
    mesmax: {type: Number },
    dragon: { type: Boolean, default: false}
});

module.exports = mongoose.model('Actividades', ActividadesSchema);