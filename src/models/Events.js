const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventsSchema = new Schema({
    desc: { type: String, required: true },
    groupUsed: { type: String },
    groupAttaqued: { type: String },
    type: {type: String },
    ataque: { type: Boolean, default: false },
    defensa: {type: Boolean, default: false},
    date: { type: Date, default: Date.now },
    class: {type: String, default: 'SinAsignar' } 
});

module.exports = mongoose.model('Events', EventsSchema);