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
const Bundle = require('../models/Bundle');


router.get('/users/signin', (req, res) => {
    res.render('users/signin.hbs');
});

router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/code',
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

router.post('/ingame', isAuthenticated, async (req, res) => {
   const subidoU = await User.findById(req.user._id);
   subidoU.subido = true;
   await subidoU.save();

   res.redirect('/ingame');
});


// ========= GROUPS =============== //

router.get('/ingame/all-groups/', isAuthenticated, async (req, res) => {
    const userId = await User.findById(req.user._id);
    
    await Group.find().sort({name: 'desc'})
      .then(async documentos => {
        const contexto = {
            groups: documentos.map(documento => {
            return {
                name: documento.name,
                _id: documento._id,
                oro: documento.oro,
                inteligencia: documento.inteligencia,
                construccion: documento.construccion,
                diamantes: documento.diamantes
            }
          })
        }
        const userAdmin = userId.admin;
        var groups = contexto.groups;
        if(req.user.admin == true){
            res.render('groups/all-groups.hbs', {groups, userAdmin });
        }else{
            req.flash('error_msg', 'You are not admin');
            res.redirect('/ingame');
        }
      });
  });

  router.get(`/ingame/edit-group/:id`, isAuthenticated, async (req, res) => {
    const userId = await User.findById(req.user._id);
    const group = await Group.findById(req.params.id);

    if(req.user.admin == true){
       res.render('groups/edit-group.hbs', {group, userId});
    }else{
        req.flash('error_msg', 'You are not admin');
        res.redirect('/ingame');
    }
});

router.put('/ingame/edit-group/:id', isAuthenticated, async (req, res) => {
    const { oro, inteligencia, construccion, diamantes } = req.body;
    await Group.findByIdAndUpdate(req.params.id, { oro, inteligencia, construccion, diamantes });
    req.flash('success_msg', 'Group Updated Successfully');
    res.redirect('/ingame/all-groups/');
  });

// =========== CARDS ========== //

router.get('/ingame/cards', isAuthenticated, async (req, res) => {
    const group = await Group.findOne({name: req.user.group});

    await Cartas.find({_id: group.cartas}).sort({date: 'desc'})
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
      res.render('cards/all-cards.hbs', { cartas, userId, group });
    });
});

router.get('/ingame/bundles', isAuthenticated, async (req, res) => {
    const group = await Group.findOne({name: req.user.group});

    await Bundle.find().sort({date: 'desc'})
    .then(async documentos => {
      const contexto = {
          bundles: documentos.map(documento => {
          return {
              name: documento.name,
              _id: documento._id,
              precio: documento.precio,
              img: documento.img,
              desc: documento.descripcion
          }
        })
      }
      const bundles = contexto.bundles;
      const userId = await User.findById(req.user._id);

      res.render('cards/all-bundles.hbs', { bundles, userId, group });
    });
});

router.get('/ingame/shop', isAuthenticated, async (req, res) => {
    const group = await Group.findOne({name: req.user.group});

    await Cartas.find().sort({date: 'desc'})
    .then(async documentos => {
      const contexto = {
          cartas: documentos.map(documento => {
          return {
              name: documento.name,
              _id: documento._id,
              precio: documento.precio,
              img: documento.img,
              desc: documento.descripcion,
              construccion: documento.construccion,
              inteligencia: documento.inteligencia

          }
        })
      }
      const cartas = contexto.cartas;
      const userId = await User.findById(req.user._id);
      res.render('cards/cards-shop.hbs', { cartas, userId, group });
    });
});

router.put('/cards/buy/:id', isAuthenticated, async (req, res) => {
    const card = await Card.findOne({_id: req.params.id});
    const group = await Group.findOne({name: req.user.group});

    if(group.oro >= card.precio){
        const estaError = [];
        for(var i=0; i<group.cartas.length;){
            if(group.cartas[i] == req.params.id){
                estaError.push(i);
                i++;
            }else{
                i++;
            }
        }

        if(estaError.length == 0){
            group.oro = group.oro - card.precio ;

            group.cartas.push(card._id);
            group.save();
            req.flash('success_msg', 'Carta comprada con exito!');
            res.redirect('/ingame/shop');
        }else{
            req.flash('error_msg', 'Ya tienes una carta de estas! Usa primero la otra y luego compra!');
            res.redirect('/ingame/shop');
        }
    }else{
        req.flash('error_msg', 'No tienes suficiente oro!');
        res.redirect('/ingame/shop');
    }

  });

  router.get('/cards/select', isAuthenticated, async (req, res) => {
    const group = await Group.findOne({name: req.user.group});

    res.render('cards/cards-select.hbs', { group });
  });

  router.put('/cards/use/:id', isAuthenticated, async (req, res) => {
    const card = await Card.findOne({_id: req.params.id});
    const group = await Group.findOne({name: req.user.group});

    const indexCarta = group.cartas.indexOf(req.params.id);
    if(indexCarta > -1){
        group.cartas.splice(indexCarta);
    }else{
        req.flash('error_msg', 'No tienes esta carta');
    }

    group.save();
  });

  router.get('/code', isAuthenticated, async (req, res) => {
    const user = await User.findOne({_id: req.user.id});
    if(user.class == 'SinAsignar'){
        res.render('users/classCode.hbs', { user });
    }else{
        res.redirect('/ingame');
    }
  });

  router.put('/code', isAuthenticated, async (req, res) => {
    const user = await User.findOne({_id: req.user.id});
    const codeClass = req.body.codeClass;

    if(codeClass == '5ff23sxg'){
        user.class = 'SMX-M';
        user.save();
    }else if(codeClass == '823jsjdk'){
        user.class = 'SMX-T';
        user.save();
    }
    
    res.redirect('/ingame');
  });


module.exports = router;