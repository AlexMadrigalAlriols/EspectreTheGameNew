const mongoose = require('mongoose');
const { Schema } = mongoose;

const BundleSchema = new Schema({
    name: { type: String, required: true },
    precio: { type: Number },
    img: { type: String },
    descripcion: { type: String }    
});

module.exports = mongoose.model('Bundle', BundleSchema);