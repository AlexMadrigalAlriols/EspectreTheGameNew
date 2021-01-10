const mongoose = require('mongoose');
const { Schema } = mongoose;

const CardsSchema = new Schema({
    name: { type: String, required: true },
    precio: { type: Number },
    type: { type: String},
    img: { type: String },
    tier: { type: String },
    descripcion: { type: String },
    inteligencia: { type: String },
    construccion: {type: String },
    visible: { type: Boolean, default: false}
});


module.exports = mongoose.model('Cartas', CardsSchema);