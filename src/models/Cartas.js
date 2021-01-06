const mongoose = require('mongoose');
const { Schema } = mongoose;

const CardsSchema = new Schema({
    name: { type: String, required: true },
    precio: { type: Number },
    img: { type: String },
    descripcion: { type: String }    
});

module.exports = mongoose.model('Cartas', CardsSchema);