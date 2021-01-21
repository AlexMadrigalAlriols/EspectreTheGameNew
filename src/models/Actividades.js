const mongoose = require('mongoose');
const { Schema } = mongoose;

const ActividadesSchema = new Schema({
    name: { type: String, required: true },
    descripcion: { type: String },
    recursosAdicionales: { type: String },
    class: { type: String }  
});

module.exports = mongoose.model('Actividades', ActividadesSchema);