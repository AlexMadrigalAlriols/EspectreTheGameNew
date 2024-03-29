const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    group: { type: String, default: 'SinAsignar'},
    North_America: { type: Boolean, default: false},
    Sud_America: { type: Boolean, default: false},
    Africa: { type: Boolean, default: false},
    Europa: { type: Boolean, default: false},
    Oceania: { type: Boolean, default: false},
    SinGroup: { type: Boolean, default: true},
    Creador: { type: Boolean, default: false},
    Asia: { type: Boolean, default: false},
    class: {type: String, default: 'SinAsignar'},
    banner: {type: String, default: '/img/bannerDefault.jpg'},
    rol: { type: String, default: 'Alumno'},
    path: { type: String, default: '/uploads/ImageProfile.jpg' },
    character: {type: String, default: '/img/skins/pobre.png'},
    admin: {type: Boolean, default: false},
    practica: {type: String },
    comentarios: {type: String},
    practicas: {type: Array},
    logros: {type: Array},
    level: { type: Number, default: 0},
    groupid: {type: String},
    exp: {type: Number, default: 0},
    logrosconseguidos: {type: String, default: 0},
    cartasusadas: {type: String, default: 0},
    description: { type: String, default: 'CAMBIA LA DESCRIPCIÓN EDITANDO EL PERFIL'},
    date: { type: Date, default: Date.now }
});


UserSchema.methods.encrypPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(password, salt);
    return hash;
};

UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);