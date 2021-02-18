const mongoose = require('mongoose');
const { Schema } = mongoose;

const SkinsSchema = new Schema({
    name: { type: String, required: true },
    img: { type: String },
    usuarios: {type: Array}
});

module.exports = mongoose.model('Skins', SkinsSchema);