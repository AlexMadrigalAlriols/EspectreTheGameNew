const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { isAuthenticated } = require('../helpers/auth');
const passport = require('passport');
const { find, findOne } = require('../models/User');
const Group = require('../models/Group');
const Game = require('../models/Game');
const Card = require('../models/Cartas');
const ExtraCards = require('../models/ExtraCards');
const Cartas = require('../models/Cartas');
const Bundle = require('../models/Bundle');
const Events = require('../models/Events');


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
                banner: documento.banner,
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


    const groupUserT = await Group.findOne({name: group + 'T'});

    const userG = await User.findById(req.params.id);

    if(req.user.class == 'SMX-M'){
        var groupUser = await Group.findOne({name: group});
        var indexGroup = groupUser.users.indexOf(req.params.id);
    }else if(req.user.class == 'SMX-T'){
        var groupUser = await Group.findOne({name: group + 'T'});
        var indexGroup = groupUser.users.indexOf(req.params.id);
    }


    if(indexGroup > -1){
        console.log('Esta en el grupo ya');
    }else{
        groupUser.users.push(req.params.id);
        const nameGroup = groupUser.name;
        
        if(nameGroup == 'North_America'){
            var North_America = req.user.North_America = true;
            var Oceania = req.user.Oceania = false;
            var Asia = req.user.Asia = false;
            var Africa = req.user.Africa = false;
            var Europa = req.user.Europa = false;
            var SinGroup = req.user.SinGroup = false;
            var Sud_America = req.user.Sud_America = false;

        }else if( nameGroup == 'Sud_America'){
            var North_America = req.user.North_America = false;
            var Oceania = req.user.Oceania = false;
            var Asia = req.user.Asia = false;
            var Africa = req.user.Africa = false;
            var Europa = req.user.Europa = false;
            var SinGroup = req.user.SinGroup = false;
            var Sud_America = req.user.Sud_America = true;
        }else if( nameGroup == 'Oceania'){
            var North_America = req.user.North_America = false;
            var Oceania = req.user.Oceania = true;
            var Asia = req.user.Asia = false;
            var Africa = req.user.Africa = false;
            var Europa = req.user.Europa = false;
            var SinGroup = req.user.SinGroup = false;
            var Sud_America = req.user.Sud_America = false;
        }else if( nameGroup == 'Asia'){
            var North_America = req.user.North_America = false;
            var Oceania = req.user.Oceania = false;
            var Asia = req.user.Asia = true;
            var Africa = req.user.Africa = false;
            var SinGroup = req.user.SinGroup = false;
            var Europa = req.user.Europa = false;
            var Sud_America = req.user.Sud_America = false;
        }else if(nameGroup == 'Europa'){
            var North_America = req.user.North_America = false;
            var Oceania = req.user.Oceania = false;
            var Asia = req.user.Asia = false;
            var Africa = req.user.Africa = false;
            var SinGroup = req.user.SinGroup = false;
            var Europa = req.user.Europa = true;
            var Sud_America = req.user.Sud_America = false;
        }else if(nameGroup == 'Africa'){
            var North_America = req.user.North_America = false;
            var Oceania = req.user.Oceania = false;
            var Asia = req.user.Asia = false;
            var Africa = req.user.Africa = true;
            var SinGroup = req.user.SinGroup = false;
            var Europa = req.user.Europa = false;
            var Sud_America = req.user.Sud_America = false;
        }else if(nameGroup == 'SinGroup'){
            var North_America = req.user.North_America = false;
            var Oceania = req.user.Oceania = false;
            var Asia = req.user.Asia = false;
            var SinGroup = req.user.SinGroup = true;
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

    if(req.user.class == 'SMX-M'){
        var group = await Group.findOne({name: user.group});
    }else if(req.user.class == 'SMX-T'){
        var group = await Group.findOne({name: user.group + 'T'});
    }

    if(user.class == 'SinAsignar'){
        res.redirect('/code');
    }else{
        if(group.Ataqued == true){
            req.flash('error_msg', 'Estas siendo atacado si no te defiendes en 24h perderas recursos!');
            res.render('layouts/mapa.hbs', { game, user, group });
        }else{
            res.render('layouts/mapa.hbs', { game, user, group });
        }
    }
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
    if(req.user.class == 'SMX-M'){
        var group = await Group.findOne({name: req.user.group});
    }else if(req.user.class == 'SMX-T'){
        var group = await Group.findOne({name: req.user.group + 'T'});
    }
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
      var cartas = contexto.cartas;
      var userId = await User.findById(req.user._id);
      res.render('cards/all-cards.hbs', { cartas, userId, group });
    });
});

router.get('/ingame/bundles', isAuthenticated, async (req, res) => {
    if(req.user.class == 'SMX-M'){
        var group = await Group.findOne({name: req.user.group});
    }else if(req.user.class == 'SMX-T'){
        var group = await Group.findOne({name: req.user.group + 'T'});
    }

    await Bundle.find().sort({date: 'desc'})
    .then(async documentos => {
      const contexto = {
          bundles: documentos.map(documento => {
          return {
              name: documento.name,
              _id: documento._id,
              precio: documento.precio,
              img: documento.img,
              modal: documento.modal,
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
    if(req.user.class == 'SMX-M'){
        var group = await Group.findOne({name: req.user.group});
    }else if(req.user.class == 'SMX-T'){
        var group = await Group.findOne({name: req.user.group + 'T'});
    }

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

router.put('/cards/buybundle/:id', isAuthenticated, async (req, res) => {
    const bundle = await Bundle.findOne({_id: req.params.id});

    if(req.user.class == 'SMX-M'){
        var group = await Group.findOne({name: req.user.group});
    }else if(req.user.class == 'SMX-T'){
        var group = await Group.findOne({name: req.user.group + 'T'});
    }

// ============== SOBRE RECURSOS ===========
    if(bundle.name == 'Sobre Recursos'){
        if(group.diamantes >= 3){
            group.diamantes = group.diamantes - 3;
            var numRand = Math.floor(Math.random() * 7);
            if(numRand == 0){
                var cartaTocada = await ExtraCards.findOne({name: 'Oro'});
                group.oro = group.oro + 550;
                req.flash('success_msg', 'Has recibido: 550 de Oro');
                group.save();
            }else if(numRand == 1){
                var cartaTocada = await ExtraCards.findOne({name: 'Bolsa De Oro'});
                group.oro = group.oro + 750;
                req.flash('success_msg', 'Has recibido: 750 de Oro');
                group.save();
    
            }else if(numRand == 2){
                var cartaTocada = await ExtraCards.findOne({name: 'Construccion Basica'});
                group.construccion = group.construccion + 2;
                req.flash('success_msg', 'Has recibido: 2 De Construccion');
                group.save();
            }else if(numRand == 3){
                var cartaTocada = await ExtraCards.findOne({name: 'Construccion Avanzada'});
                group.construccion = group.construccion + 4;
                req.flash('success_msg', 'Has recibido: 4 De Construccion');
                group.save();
    
            }else if(numRand == 4){
                var cartaTocada = await ExtraCards.findOne({name: 'Inteligencia Basica'});
                group.inteligencia = group.inteligencia + 2;
                req.flash('success_msg', 'Has recibido: 2 De Inteligencia');
                group.save();
            }else if(numRand == 5){
                var cartaTocada = await ExtraCards.findOne({name: 'Inteligencia Avanzada'});
                group.inteligencia = group.inteligencia + 4;
                req.flash('success_msg', 'Has recibido: 4 De Inteligencia');
                group.save();
            }else if(numRand == 6){
                var cartaTocada = await ExtraCards.findOne({name: 'Diamantes'});
                group.diamantes = group.diamantes + 2;
                req.flash('success_msg', 'Has recibido: 2 Diamantes');
                group.save();
            }else if(numRand == 7){
                var cartaTocada = await ExtraCards.findOne({name: 'Bolsa de Diamantes'});
                group.diamantes = group.diamantes + 4;
                group.save();
            }
            
            var descripcion = cartaTocada.descripcion;
            res.render('cards/bundle-opened.hbs', { group, cartaTocada,descripcion });
        }else if(group.diamantes < 3){
            req.flash('error_msg', 'No tienes los suficientes diamantes para comprar este sobre!');
            res.redirect('/ingame/bundles/');
        }



    // ========== SOBRE DEFENSA =============
    }else if(bundle.name == 'Sobre Defensas'){
        if(group.diamantes >= 5){
            group.diamantes = group.diamantes - 5;
            var numRand = Math.floor(Math.random() * 5);

            if(numRand == 0){
                var cartaTocada = await Card.findOne({name: 'Antimisiles'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);
                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 500;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }

                group.save();
            }else if(numRand == 1){
                var cartaTocada = await Card.findOne({name: 'Defensa Militar'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);
                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 500;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }
                group.save();
    
            }else if(numRand == 2){
                var cartaTocada = await Card.findOne({name: 'Barricadas'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);
                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 500;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }

                group.save();
            }else if(numRand == 3){
                var cartaTocada = await Card.findOne({name: 'Firewall'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);
                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 500;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }

                group.save();
    
            }else if(numRand == 4){
                var cartaTocada = await Card.findOne({name: 'Equipo de Ciberseguridad'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);
                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 500;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }

                group.save();
            }else if(numRand == 5){
                var cartaTocada = await Card.findOne({name: 'Inteligencia Avanzada'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);

                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 500;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }

                group.save();
            }   
            console.log(cartaTocada._id);
            res.render('cards/bundle-opened.hbs', { group, cartaTocada, descripcion });
        }else if(group.diamantes < 5){
            req.flash('error_msg', 'No tienes los suficientes diamantes para comprar este sobre!');
            res.redirect('/ingame/bundles/');
        }

    // ======== SOBRE DE ATAQUE ========
    }else if(bundle.name == 'Sobre Ataques'){
        if(group.diamantes >= 7){
            group.diamantes = group.diamantes - 7;
            var numRand = Math.floor(Math.random() * 8);

            if(numRand == 0){
                var cartaTocada = await Card.findOne({name: 'Ataque Aereo'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);
                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 700;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }

                group.save();
            }else if(numRand == 1){
                var cartaTocada = await Card.findOne({name: 'Ataque Terrestre'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);
                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 700;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }
                group.save();
    
            }else if(numRand == 2){
                var cartaTocada = await Card.findOne({name: 'Ataque Aliado'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);
                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 700;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }

                group.save();
            }else if(numRand == 3){
                var cartaTocada = await Card.findOne({name: 'Ataque de Phishing'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);
                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 700;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }

                group.save();
    
            }else if(numRand == 4){
                var cartaTocada = await Card.findOne({name: 'Ingeniería social'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);
                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 700;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }

                group.save();
            }else if(numRand == 5){
                var cartaTocada = await Card.findOne({name: 'Ataque DDOS'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);

                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 700;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }

                group.save();
            }else if(numRand == 6){
                var cartaTocada = await Card.findOne({name: 'Ataque de Bot net'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);

                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 700;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }

                group.save();  
            }else if(numRand == 7){
                var cartaTocada = await Card.findOne({name: 'Ataque Spoofing'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);

                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 700;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }

                group.save();
            }else if(numRand == 8){
                var cartaTocada = await Card.findOne({name: 'Ataque de Babosa'});
                const indexCarta = group.cartas.indexOf(cartaTocada._id);

                if(indexCarta > -1){
                    var descripcion = "Ya tienes esta carta te damos oro a cambio";
                    group.oro = group.oro + 700;
                }else{
                    var descripcion = cartaTocada.descripcion;
                    group.cartas.push(cartaTocada._id);
                }

                group.save();
            }

            res.render('cards/bundle-opened.hbs', { group, cartaTocada, descripcion });
        
        }else if(group.diamantes < 7){
            req.flash('error_msg', 'No tienes los suficientes diamantes para comprar este sobre!');
            res.redirect('/ingame/bundles/');
        }
    }
  });

router.put('/cards/buy/:id', isAuthenticated, async (req, res) => {
    const card = await Card.findOne({_id: req.params.id});
    if(req.user.class == 'SMX-M'){
        var group = await Group.findOne({name: req.user.group});
    }else if(req.user.class == 'SMX-T'){
        var group = await Group.findOne({name: req.user.group + 'T'});
    }

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
    if(req.user.class == 'SMX-M'){
        var group = await Group.findOne({name: req.user.group});
    }else if(req.user.class == 'SMX-T'){
        var group = await Group.findOne({name: req.user.group + 'T'});
    }

    res.render('cards/cards-select.hbs', { group });
  });
  router.get('/cards/use/:id', isAuthenticated, async (req, res) => {
    const card = await Card.findOne({_id: req.params.id});
    const events = await Events.find();
    const user = await User.findById(req.user.id);

    if(req.user.class == 'SMX-M'){
        var group = await Group.findOne({name: req.user.group});
    }else if(req.user.class == 'SMX-T'){
        var group = await Group.findOne({name: req.user.group + 'T'});

    }
    if(card.type == 'Ataque'){
        res.render('cards/use-cards.hbs', {card, events, user, group});
    }else if(card.type == 'Defensa'){
        if(group.Ataqued == false){
            req.flash('error_msg', 'No estas siendo atacado no puedes defenderte!');
            res.redirect('/ingame/cards/');
        }else{
            res.render('cards/defend-cards.hbs', {card, events, user, group});
        }
    }
  });

  router.put('/cards/use/:id', isAuthenticated, async (req, res) => {

    const card = await Card.findOne({_id: req.params.id});
    const events = await Events.find();
    const user = await User.findById(req.user.id);
    if(req.user.class == 'SMX-M'){
        var group = await Group.findOne({name: req.user.group});
    }else if(req.user.class == 'SMX-T'){
        var group = await Group.findOne({name: req.user.group + 'T'});
    }

    const indexCarta = group.cartas.indexOf(req.params.id);
    if(indexCarta > -1){

        if(card.type == 'Ataque'){
            var desc = group.name + ' ' +'ha usado la carta' + ' ' + card.name + ' contra ' + req.body.groupAttac;
        }else if(card.type == 'Defensa'){
            var desc = group.name + ' ' +'ha usado ' + ' ' + card.name + ' ' + '  para defenderse.';
        }


        const groupUsed = group.name;
        const groupAttaqued = req.body.groupAttac;
        var cartas = group.cartas;
        var TierOfAttacked = group.TierOfAttacked;
        const type = card.type;


        if(card.type == 'Ataque'){
            group.TierOfAttacked = card.tier;
            var ataque = true;
            var defensa = false;
        }else{
            var ataque = false;
            var defensa = true;
        }
        
        newEvent = new Events({desc, groupUsed, groupAttaqued, type, class: user.class, ataque, defensa});
        await newEvent.save();
        

        if(card.type == 'Defensa'){
            if(card.tier == group.TierOfAttacked){
                const Ataqued = group.Ataqued = false;
                group.cartas.splice(indexCarta);

                group.save({Ataqued, cartas, TierOfAttacked});
                req.flash('success_msg', 'Has Defendido Con Exito!');
                res.redirect('/ingame/cards');
            }else{
                req.flash('error_msg', 'No has usado una carta de defensa con el tier que toca! Usa Tier: '+group.TierOfAttacked+'');
                res.redirect('/ingame/cards');
            }

        }else if(card.type == 'Ataque'){
            group.cartas.splice(indexCarta);
            var groupAtacado = await Group.findOne({name: req.body.groupAttac});
            groupAtacado.Ataqued = true;
            groupAtacado.save();
            group.save({cartas, TierOfAttacked});
            req.flash('success_msg', 'Has atacado Con Exito!');
            res.redirect('/ingame/cards');
        }else{
            console.log('Que coño?')
        }
    }else{
        req.flash('error_msg', 'No tienes esta carta');
        res.redirect('/ingame/cards/');
    }
  });

  // ===== CODE CLASS ======= //
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

// ========= CONSOLA EVENTOS ======= //

router.get('/ingame/events/', isAuthenticated, async (req, res) => {
    const events = await Events.find();
    const users = await User.findById(req.user.id);

    newEvent = new Events({desc: 'Duki', groupUsed: 'duki', groupAttaqued: 'dukardo',});
    await newEvent.save();
    await Events.find({class: users.class}).sort({date: 'desc'})
    .then(async documentos => {
      const contexto = {
          events: documentos.map(documento => {
          return {
              desc: documento.desc,
              _id: documento._id,
              type: documento.type,
              class: documento.class,
              groupUsed: documento.groupUsed,
              groupAttaqued: documento.groupAttaqued,
              date: documento.date,
              ataque: documento.ataque,
              defensa: documento.defensa
          }
        })
      }
      if(req.user.admin == true){
        res.render('game/consoleEvents.hbs', { events });
      }else{
        req.flash('error_msg', 'Your are not admin!');
        res.redirect('/ingame');
      }
    });
  });

  router.delete('/event/delete/:id', isAuthenticated, async (req, res) => {
    await Events.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Evento borrado con exito!');
    res.redirect('/ingame/events');
  });
module.exports = router;