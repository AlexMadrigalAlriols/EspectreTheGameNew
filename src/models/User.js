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
    Asia: { type: Boolean, default: false},
    class: {type: String, default: 'SinAsignar'},
    rol: { type: String, default: 'Alumno'},
    subido: { type: Boolean, default: false},
    path: { type: String, default: '/uploads/ImageProfile.jpg' },
    admin: {type: Boolean, default: false},
    description: { type: String, default: 'CAMBIA LA DESCRIPCIÓN EDITANDO EL PERFIL'},
    date: { type: Date, default: Date.now },
    smxm : { type: Boolean, default: false},
    smxt: { type: Boolean, default: false}
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