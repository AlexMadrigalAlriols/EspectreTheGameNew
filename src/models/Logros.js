const mongoose = require('mongoose');
const { Schema } = mongoose;

const LogrosSchema = new Schema({
    name: { type: String, required: true },
    img: { type: String },
    recompensaexp: {type: Number},
    players: { type: Array},
    recompensa: { type: String}
});

module.exports = mongoose.model('Logros', LogrosSchema);