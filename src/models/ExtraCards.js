const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExtraCardsSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String},
    img: { type: String },
    descripcion: { type: String },
    inteligencia: { type: String },
    construccion: {type: String }
});

module.exports = mongoose.model('ExtraCards', ExtraCardsSchema);