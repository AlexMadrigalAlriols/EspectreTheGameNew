const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { isAuthenticated } = require('../helpers/auth');
const passport = require('passport');
const { find } = require('../models/User');
const Group = require('../models/Group');
const Game = require('../models/Game');
const Card = require('../models/Cartas');
const Cartas = require('../models/Cartas');


router.get('/users/signin', (req, res) => {
    res.render('users/signin.hbs');
});

router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/ingame',
    failureRedirect: '/users/signin',
    failureFlash: true
}));

router.get('/users/signup', (req, res) => {
    res.render('users/signup.hbs');
});

router.get('/users/all-users/', isAuthenticated, async (req, res) => {
    const userId = await User.findById(req.user._id);
    
    await User.find({class: req.user.class}).sort({name: 'desc'})
      .then(async documentos => {
        const contexto = {
            users: documentos.map(documento => {
            return {
                name: documento.name,
                _id: documento._id,
                email: documento.email,
                description: documento.description,
                group: documento.group,
                class: documento.class,
                ProfileImg: documento.path
            }
          })
        }
        const userAdmin = userId.admin;
        const users = contexto.users;
        res.render('users/all-users.hbs', {users, userAdmin });
      });
  });

router.post('/users/signup', async (req, res) => {
    const { name, email, rol, password, confirm_password } = req.body;
    const errors = [];

    if(name.length <= 0) {
        errors.push({text: 'Please Insert your Name'});
    }

    if(password == confirm_password) {
        errors.push({text: 'Password do not match'});
    }
    if (password.length < 4) {
        errors.push({text: 'Password mustbe at least 4 characters'});
    }
    if(errors.length > 0) {
        res.render('users/signup.hbs', {errors, name, email, rol, password, confirm_password});
    }else{
        const emailUser = await User.findOne({email: email});
        if(emailUser) {
            req.flash('error_msg', 'The Email is already in use');
            res.redirect('/users/signup')
        }
        const newUser = new User({name, email, rol, password});
        newUser.password = await newUser.encrypPassword(password);
        await newUser.save();
        req.flash('success_msg', 'You are registred');
        res.redirect('/users/signin');
    }
});


router.get(`/users/edit-user/:id`, isAuthenticated, async (req, res) => {
    const userId = await User.findById(req.user._id);
    const user = await User.findById(req.params.id);


    res.render('users/edit-user.hbs', {user, userId});
});

router.put('/users/edit-user/:id', isAuthenticated, async (req, res, file) => {
    const lastImage = await User.findById(req.user._id);


    const { name, email, description, group } = req.body;

    const groupUser = await Group.findOne({name: group});

    const userG = await User.findById(req.params.id);

    const estaError = [];

    for(var i=0; i<groupUser.users.length;){
        if(groupUser.users[i] == req.params.id){
            console.log('Esta en el grupo');
            estaError.push(i);
            i++;
        }else{
            i++;
        }
    }


    if(estaError.length == 0){
        groupUser.users.push(req.params.id);
        const nameGroup = groupUser.name;
        
        if(nameGroup == 'North_America'){
            var North_America = req.user.North_America = true;

            var Oceania = req.user.Oceania = false;
            var Asia = req.user.Asia = false;
            var Africa = req.user.Africa = false;
            var Europa = req.user.Europa = false;
            var Sud_America = req.user.Sud_America = false;
        }else if( nameGroup == 'Sud_America'){
            var North_America = req.user.North_America = false;
            var Oceania = req.user.Oceania = false;
            var Asia = req.user.Asia = false;
            var Africa = req.user.Africa = false;
            var Europa = req.user.Europa = false;
            var Sud_America = req.user.Sud_America = true;
        }else if( nameGroup == 'Oceania'){
            var North_America = req.user.North_America = false;
            var Oceania = req.user.Oceania = true;
            var Asia = req.user.Asia = false;
            var Africa = req.user.Africa = false;
            var Europa = req.user.Europa = false;
            var Sud_America = req.user.Sud_America = false;
        }else if( nameGroup == 'Asia'){
            var North_America = req.user.North_America = false;
            var Oceania = req.user.Oceania = false;
            var Asia = req.user.Asia = true;
            var Africa = req.user.Africa = false;
            var Europa = req.user.Europa = false;
            var Sud_America = req.user.Sud_America = false;
        }else if(nameGroup == 'Europa'){
            var North_America = req.user.North_America = false;
            var Oceania = req.user.Oceania = false;
            var Asia = req.user.Asia = false;
            var Africa = req.user.Africa = false;
            var Europa = req.user.Europa = true;
            var Sud_America = req.user.Sud_America = false;
        }else if(nameGroup == 'Africa'){
            var North_America = req.user.North_America = false;
            var Oceania = req.user.Oceania = false;
            var Asia = req.user.Asia = false;
            var Africa = req.user.Africa = true;
            var Europa = req.user.Europa = false;
            var Sud_America = req.user.Sud_America = false;
        }else if(nameGroup == 'SinGroup'){
            var North_America = req.user.North_America = false;
            var Oceania = req.user.Oceania = false;
            var Asia = req.user.Asia = false;
            var Africa = req.user.Africa = false;
            var Europa = req.user.Europa = false;
            var Sud_America = req.user.Sud_America = false;
        }

        await groupUser.save();
    }

    if(req.file == null) {
        const path = lastImage.path;
        await User.findByIdAndUpdate(req.params.id, { name, email, description, group, path });
        req.flash('success_msg', 'Profile Updated');
        res.redirect('/ingame');
    
    }else{
        const path = '/uploads/' + req.file.filename;
        
    await User.findByIdAndUpdate(req.params.id, { name, email, description, group, path });
    req.flash('success_msg', 'Profile Updated');
    res.redirect('/ingame');
    }

  });

  router.delete('/users/delete/:id', isAuthenticated, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'User Deleted Successfully');
    res.redirect('/users/all-users');
  });

router.get('/users/logout', (req, res) => {
    req.logOut();
    res.redirect('/')
});

router.get('/ingame', isAuthenticated, async (req, res) =>{
    var game = await Game.findById('5fedf15fa1268c39d8229e47');
    var user = await User.findById(req.user.id);

    var group = await Group.findOne({name: user.group});

    res.render('layouts/mapa.hbs', { game, user, group });
});

router.get('/ingame/gameSettings', isAuthenticated, async (req, res) => {
    const game = await Game.findById('5fedf15fa1268c39d8229e47');
    var user = await User.findById(req.user.id);

    if(req.user.admin == true){
        res.render('./game/gameSettings.hbs', {game});
    }else{
        res.redirect('/ingame');
    }
});

router.put('/ingame/gameSettings', isAuthenticated, async (req, res, file) => {
    const lastGame = await Game.findById('5fedf15fa1268c39d8229e47');
    var user = await User.findById(req.user.id);

    if(req.file == null){
        var periodico = lastGame.periodico;
    }else{
        var periodico  = req.file.filename;

        var subido = user.subido;
        subido = false;
    }

    const year = req.body.year;

    if(req.body.mapa == "ningunoElegido"){
        var mapa = lastGame.mapa;
    } else{
        var mapa = req.body.mapa;
    }

    await Game.findByIdAndUpdate('5fedf15fa1268c39d8229e47', { periodico, year, mapa });
    await User.findByIdAndUpdate(req.user.id, { subido })
    res.redirect('/ingame');
});

router.get('/ingame/cards', isAuthenticated, async (req, res) => {
    await Cartas.find().sort({date: 'desc'})
    .then(async documentos => {
      const contexto = {
          cartas: documentos.map(documento => {
          return {
              name: documento.name,
              _id: documento._id,
              precio: documento.precio,
              img: documento.img,
              desc: documento.descripcion
          }
        })
      }
      const cartas = contexto.cartas;
      const userId = await User.findById(req.user._id);
      res.render('cards/all-cards.hbs', { cartas, userId });
    });
});
router.post('/ingame', isAuthenticated, async (req, res) => {
   const subidoU = await User.findById(req.user._id);
   subidoU.subido = true;
   await subidoU.save();

   
   res.redirect('/ingame');
});

module.exports = router;