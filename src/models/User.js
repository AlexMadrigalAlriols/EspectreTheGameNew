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
    Asia: { type: Boolean, default: false},
    class: {type: String, default: 'SinAsignar'},
    banner: {type: String, default: 'https://hipertextual.com/files/2013/11/Wallpaper-Monta%C3%B1as.jpg'},
    rol: { type: String, default: 'Alumno'},
    path: { type: String, default: '/uploads/ImageProfile.jpg' },
    character: {type: String, default: '/img/skins/pobre.png'},
    admin: {type: Boolean, default: false},
    practica: {type: String },
    comentarios: {type: String},
    logros: {type: Array},
    level: { type: Number},
    groupid: {type: String},
    exp: {type: String},
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