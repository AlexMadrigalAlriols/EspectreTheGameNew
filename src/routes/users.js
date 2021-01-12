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
                subido: documento.subido,
                practica: documento.practica,
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
    const lastImage = await User.findById(req.params.id);
    var user = await User.findById(req.params.id);
    
    const { name, email, description, group } = req.body;
    
    user.name = name;
    user.email = email;
    user.description = description;
    user.group = group;
    
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
            user.North_America = true;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = false;
            await user.save();
        }else if( nameGroup == 'Sud_America'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = true;
            await user.save();
        }else if( nameGroup == 'Oceania'){
            user.North_America = false;
            user.Oceania = true;
            user.Asia = false;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = false;
            await user.save();
        }else if( nameGroup == 'Asia'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = true;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = false;
            await user.save();
        }else if(nameGroup == 'Europa'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = false;
            user.Europa = true;
            user.SinGroup = false;
            user.Sud_America = false;
            await user.save();
        }else if(nameGroup == 'Africa'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = true;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = false;
            await user.save();
        }else if(nameGroup == 'SinGroup'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = true;
            user.Sud_America = false;
            await user.save();
        }else if(nameGroup == 'North_AmericaT'){
            user.North_America = true;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = false;
        }else if(nameGroup == 'Sud_AmericaT'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = true;
        }else if(nameGroup == 'OceaniaT'){
            user.North_America = false;
            user.Oceania = true;
            user.Asia = false;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = false;
        }else if(nameGroup == 'AfricaT'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = true;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = false;
        }else if(nameGroup == 'AsiaT'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = true;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = false;
        }else if(nameGroup == 'EuropaT'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = false;
            user.Europa = true;
            user.SinGroup = false;
            user.Sud_America = false;
        }

        await groupUser.save();
    }

    if(req.file == null) {
        var path = lastImage.path;
        user.path = path;
        req.flash('success_msg', 'Profile Updated');
        res.redirect('/ingame/');
    
    }else{
        var path = '/uploads/' + req.file.filename;
        user.path = path;
        req.flash('success_msg', 'Profile Updated');
        res.redirect('/ingame/');
    }

    await user.save();
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
    var user = await User.findById(req.user.id);

    if(req.user.class == 'SMX-M'){
        var group = await Group.findOne({name: user.group});
        var game = await Game.findById('5fedf15fa1268c39d8229e47');
            if(group.Ataqued == true){
              req.flash('attack_msg', 'Estas siendo atacado usa una carta de defensa para defenderte!');
              res.redirect('/ingame/cards/');
           }else{
              res.render('layouts/mapa.hbs', { game, user, group });
           }
    }else if(req.user.class == 'SMX-T'){
        var game = await Game.findById('5ffc9ddda5b1f82890d99841');
        var group = await Group.findOne({name: user.group + 'T'});
        if(group.Ataqued == true){
              req.flash('attack_msg', 'Estas siendo atacado usa una carta de defensa para defenderte!');
              res.redirect('/ingame/cards/');
           }else{
              res.render('layouts/mapa.hbs', { game, user, group });
           }
    }else{
        res.redirect('/code');
    }
});

router.get('/ingame/gameSettings', isAuthenticated, async (req, res) => {
    if(req.user.class == 'SMX-M'){
        var game = await Game.findById('5fedf15fa1268c39d8229e47');
    }else if(req.user.class == 'SMX-T'){
        var game = await Game.findById('5ffc9ddda5b1f82890d99841');
    }

    if(req.user.admin == true){
        res.render('./game/gameSettings.hbs', {game});
    }else{
        res.redirect('/ingame');
    }
});

router.put('/ingame/gameSettings', isAuthenticated, async (req, res, file) => {
    if(req.user.class == 'SMX-M'){
        var lastGame = await Game.findById('5fedf15fa1268c39d8229e47');
        var group = await Group.findOne({name: req.user.group});
        var North_America = await Group.findOne({name: 'North_America'});
        var Sud_America = await Group.findOne({name: 'Sud_America'});
        var Oceania = await Group.findOne({name: 'Oceania'});
        var Africa = await Group.findOne({name: 'Africa'});
        var Europa = await Group.findOne({name: 'Europa'});
        var Asia = await Group.findOne({name: 'Asia'});
    }else if(req.user.class == 'SMX-T'){
        var lastGame = await Game.findById('5ffc9ddda5b1f82890d99841');
        var group = await Group.findOne({name: req.user.group + 'T'});
        var North_America = await Group.findOne({name: 'North_AmericaT'});
        var Sud_America = await Group.findOne({name: 'Sud_AmericaT'});
        var Oceania = await Group.findOne({name: 'OceaniaT'});
        var Africa = await Group.findOne({name: 'AfricaT'});
        var Europa = await Group.findOne({name: 'EuropaT'});
        var Asia = await Group.findOne({name: 'AsiaT'});
    }
 

    var user = await User.findById(req.user.id);

    if(req.file == null){
        var periodico = lastGame.periodico;
    }else{
        var periodico  = req.file.filename;

        North_America.subido = false;
        Sud_America.subido = false;
        Oceania.subido = false;
        Africa.subido = false;
        Europa.subido = false;
        Asia.subido = false;
        Asia.save();
        Africa.save();
        Oceania.save();
        North_America.save();
        Sud_America.save();
        Europa.save();
    }

    const year = req.body.year;

    if(req.body.mapa == "ningunoElegido"){
        var mapa = lastGame.mapa;
    } else{
        var mapa = req.body.mapa;
    }

    await Game.findByIdAndUpdate('5fedf15fa1268c39d8229e47', { periodico, year, mapa });
    await group.save();
    res.redirect('/ingame');
});

router.post('/ingame', isAuthenticated, async (req, res, file) => {
   const subidoU = await Group.findOne({name: req.user.group});
   console.log(req.file.name);
   subidoU.practica = '/uploads/' + req.file.filename;
   subidoU.subido = true;

   await subidoU.save();
   res.redirect('/ingame');
});


// ========= GROUPS =============== //

router.get('/ingame/all-groups/', isAuthenticated, async (req, res) => {
    const userId = await User.findById(req.user._id);
    const group = await Group.find();
    
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
              construccion: documento.construccion,
              inteligencia: documento.inteligencia,
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
              visible: documento.visible,
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
    }else if(card.type == 'Event'){
        res.render('cards/defend-cards.hbs', {card, events, user, group});
    }else if(card.type == 'Inicial'){
        res.render('cards/defend-cards.hbs', {card, events, user, group});
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

    const indexCarta = await group.cartas.indexOf(req.params.id);
    if(indexCarta > -1){

        if(card.type == 'Ataque'){
            var desc = group.name + ' ' +'ha usado la carta' + ' ' + card.name + ' contra ' + req.body.groupAttac;
        }else if(card.type == 'Defensa'){
            var desc = group.name + ' ' +'ha usado ' + ' ' + card.name + ' ' + '  para defenderse.';
        }else{
            var desc = group.name + ' ' +'ha usado ' + ' ' + card.name;
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
        }else if(card.type == 'Defensa'){
            var ataque = false;
            var defensa = true;
        }
        
        newEvent = new Events({desc, groupUsed, groupAttaqued, type, class: user.class, ataque, defensa});
        await newEvent.save();
        

        if(card.type == 'Defensa'){
            if(card.tier == group.TierOfAttacked){
                const Ataqued = group.Ataqued = false;
                group.cartas.splice(indexCarta);

                if(card.name == 'Antimisiles'){
                    var construccion = group.construccion + 2;
                    var inteligencia = group.inteligencia + 1;
                }else if(card.name == 'Defensa Militar'){
                    var inteligencia = group.inteligencia + 1;
                }else if(card.name == 'Barricadas'){
                    if(group.construccion >= 2){
                        var construccion = group.construccion - 2;
                    }else{
                        req.flash('error_msg', 'No tienes sufficiente puntos de construcción');
                        res.redirect('/ingame/cards');
                    }
                }else if(card.name == 'Firewall'){
                    var inteligencia = group.inteligencia + 2;
                }else if(card.name == 'Equipo de Ciberseguridad'){
                    var inteligencia = group.inteligencia + 3;
                }else{
                    req.flash('error_msg', 'No existe esta carta.');
                    res.redirect('/ingame/cards');
                }

                group.save({Ataqued, cartas, TierOfAttacked, construccion, inteligencia});
                req.flash('success_msg', 'Has Defendido Con Exito!');
                res.redirect('/ingame/cards');
            }else{
                req.flash('error_msg', 'No has usado una carta de defensa con el tier que toca! Usa Tier: '+group.TierOfAttacked+'');
                res.redirect('/ingame/cards');
            }

        }else if(card.type == 'Ataque'){
            
            if(req.user.class == 'SMX-M'){
            var groupAtacado = await Group.findOne({name: req.body.groupAttac});
            }else{
            var groupAtacado = await Group.findOne({name: req.body.groupAttac + 'T'});               
            }
    
            groupAtacado.Ataqued = true;
            var construccion = 0;
            if(card.name == 'Ataque Aereo'){
                if(group.inteligencia >= 1){
                    var inteligencia = group.inteligencia - 1;
                }else{
                    req.flash('error_msg', 'No tienes sufficientes puntos de inteligencia');
                    res.redirect('/ingame/cards');
                }

                if(group.construccion >= 2){
                    var construccion = group.construccion - 2;
                    group.cartas.splice(indexCarta);
                }else{
                    req.flash('error_msg', 'No tienes sufficientes puntos de construccion');
                    res.redirect('/ingame/cards');
                }
            }else if(card.name == 'Ataque Terrestre'){
                if(group.inteligencia >= 2){
                    var inteligencia = group.inteligencia - 2;
                }else{
                    req.flash('error_msg', 'No tienes sufficientes puntos de inteligencia');
                    res.redirect('/ingame/cards');
                }

                if(group.construccion >= 2){
                    var construccion = group.construccion - 2;
                    group.cartas.splice(indexCarta);
                }else{
                    req.flash('error_msg', 'No tienes sufficientes puntos de construccion');
                    res.redirect('/ingame/cards');
                }
            }else if(card.name == 'Ataque Aliado'){
                if(group.inteligencia >= 3){
                    var inteligencia = group.inteligencia - 3;
                }else{
                    req.flash('error_msg', 'No tienes sufficientes puntos de inteligencia');
                    res.redirect('/ingame/cards');
                }

                if(group.construccion >= 1){
                    var construccion = group.construccion - 1;
                    group.cartas.splice(indexCarta);
                }else{
                    req.flash('error_msg', 'No tienes sufficientes puntos de construccion');
                    res.redirect('/ingame/cards');
                }
            }else if(card.name == 'Ataque de Phishing'){
                if(group.inteligencia >= 4){
                    var inteligencia = group.inteligencia - 4;
                    group.cartas.splice(indexCarta);
                }else{
                    req.flash('error_msg', 'No tienes sufficientes puntos de inteligencia');
                    res.redirect('/ingame/cards');
                }
            }else if(card.name == 'Ingeniería social'){
                if(group.inteligencia >= 6){
                    var inteligencia = group.inteligencia - 6;
                    group.cartas.splice(indexCarta);
                }else{
                    req.flash('error_msg', 'No tienes sufficientes puntos de inteligencia');
                    res.redirect('/ingame/cards');
                }
            }else if(card.name == 'Ataque DDOS'){
                if(group.inteligencia >= 7){
                    var inteligencia = group.inteligencia - 7;
                    group.cartas.splice(indexCarta);
                }else{
                    req.flash('error_msg', 'No tienes sufficientes puntos de inteligencia');
                    res.redirect('/ingame/cards');
                }
            }else if(card.name == 'Ataque de Bot net'){
                if(group.inteligencia >= 8){
                    var inteligencia = group.inteligencia - 8;
                    group.cartas.splice(indexCarta);
                }else{
                    req.flash('error_msg', 'No tienes sufficientes puntos de inteligencia');
                    res.redirect('/ingame/cards');
                }
            }else if(card.name == 'Ataque Spoofing'){
                if(group.inteligencia >= 5){
                    var inteligencia = group.inteligencia - 5;
                    group.cartas.splice(indexCarta);
                }else{
                    req.flash('error_msg', 'No tienes sufficientes puntos de inteligencia');
                    res.redirect('/ingame/cards');
                }
            }else if(card.name == 'Ataque de Babosa'){
                if(group.inteligencia >= 0){
                    var inteligencia = group.inteligencia - 0;
                    group.cartas.splice(indexCarta);
                    
                }else{
                    req.flash('error_msg', 'No tienes sufficientes puntos de inteligencia');
                    res.redirect('/ingame/cards');
                }
            }

            groupAtacado.save();
            group.save({cartas, TierOfAttacked, construccion, inteligencia});
            req.flash('success_msg', 'Has atacado Con Exito!');
            res.redirect('/ingame/cards');

        }else if(card.type == 'Inicial'){
            if(card.name == 'Oceania'){
                group.cartas.splice(indexCarta);
                const oro = group.oro = group.oro + 3000;
                const construccion = group.construccion = group.construccion + 5;
                group.save({oro, construccion, cartas});
                req.flash('success_msg', 'Has usado la carta con exito!');
                res.redirect('/ingame/cards/');
            }else if(card.name == 'North America'){
                group.cartas.splice(indexCarta);
                const oro = group.oro = group.oro + 3000;
                const inteligencia = group.inteligencia = group.inteligencia + 2;
                group.save({oro, inteligencia, cartas});
                req.flash('success_msg', 'Has usado la carta con exito!');
                res.redirect('/ingame/cards/');
            }else if(card.name == 'Europa'){
                group.cartas.splice(indexCarta);
                const oro = group.oro = group.oro + 3500;
                group.save({oro, cartas});
                req.flash('success_msg', 'Has usado la carta con exito!');
                res.redirect('/ingame/cards/');
            }else if(card.name == 'Asia'){
                group.cartas.splice(indexCarta);
                const oro = group.oro = group.oro + 3250;
                const inteligencia = group.inteligencia = group.inteligencia + 1;
                group.save({oro, inteligencia, cartas});
                req.flash('success_msg', 'Has usado la carta con exito!');
                res.redirect('/ingame/cards/');
            }else if(card.name == 'Africa'){
                group.cartas.splice(indexCarta);
                const oro = group.oro = group.oro + 3000;
                const diamantes = group.diamantes = group.diamantes + 1;
                group.save({oro, diamantes, cartas});
                req.flash('success_msg', 'Has usado la carta con exito!');
                res.redirect('/ingame/cards/');
            }else if(card.name == 'Sud America'){
                group.cartas.splice(indexCarta);
                const oro = group.oro = group.oro + 3000;
                const diamantes = group.diamantes = group.diamantes + 1;
                group.save({oro, diamantes, cartas});
                req.flash('success_msg', 'Has usado la carta con exito!');
                res.redirect('/ingame/cards/');
            }
        }   
    }else if(card.type == 'Event'){

        if(req.user.class == 'SMX-M'){
            var North_America = await Group.findOne({name: 'North_America'});
            var Sud_America = await Group.findOne({name: 'Sud_America'});
            var Oceania = await Group.findOne({name: 'Oceania'});
            var Asia = await Group.findOne({name: 'Asia'});
            var Africa = await Group.findOne({name: 'Africa'});
            var Europa = await Group.findOne({name: 'Europa'});
        }else if(req.user.class == 'SMX-T'){
            var North_America = await Group.findOne({name: 'North_AmericaT'});
            var Sud_America = await Group.findOne({name: 'Sud_AmericaT'});
            var Oceania = await Group.findOne({name: 'OceaniaT'});
            var Asia = await Group.findOne({name: 'AsiaT'});
            var Africa = await Group.findOne({name: 'AfricaT'});
            var Europa = await Group.findOne({name: 'EuropaT'});
        }

        if(card.name == 'Tornado'){
            if(North_America.construccion <= 5){
                construccion = North_America.construccion = 0;
            }else{
                construccion = North_America.construccion = North_America.construccion - 5; 
            }
            if(Sud_America.construccion <= 5){
                construccion1 = Sud_America.construccion = 0;
            }else{
                construccion1 = Sud_America.construccion = Sud_America.construccion - 5;
            }
            if(Oceania.construccion <= 5){
                construccion2 = Oceania.construccion = 0;
            }else{
                construccion2 = Oceania.construccion = Oceania.construccion - 5;
            }
            if(Asia.construccion <= 5){
                construccion3 = Asia.construccion = 0;
            }else{
                construccion3 = Asia.construccion = Asia.construccion - 5;
            }
            if(Africa.construccion <= 5){
                construccion4 = Africa.construccion = 0;
            }else{
                construccion4 = Africa.construccion = Africa.construccion - 5;
            }
            if(Europa.construccion <= 5){
                construccion5 = Europa.construccion = 0;
            }else{
                construccion5 = Europa.construccion = Europa.construccion - 5;
            }

            North_America.save({construccion: construccion});
            Sud_America.save({construccion: construccion1});
            Oceania.save({construccion: construccion2});
            Asia.save({construccion: construccion3});
            Africa.save({construccion: construccion4});
            Europa.save({construccion: construccion5});

        }else if(card.name == 'Minas Encontradas'){
            oro = North_America.oro = North_America.oro + 750; 
            oro1 = Sud_America.oro = Sud_America.oro + 750;
            oro2 = Oceania.oro = Oceania.oro + 750;
            oro3 = Asia.oro = Asia.oro + 750;
            oro4 = Africa.oro = Africa.oro + 750;
            oro5 = Europa.oro = Europa.oro + 750;

            North_America.save({oro: oro});
            Sud_America.save({oro: oro1});
            Oceania.save({oro: oro2});
            Asia.save({oro: oro3});
            Africa.save({oro: oro4});
            Europa.save({oro: oro5});
        }else if(card.name == 'Diluvio'){
            if(North_America.construccion <= 2){
                construccion = North_America.construccion = 0;
            }else{
                construccion = North_America.construccion = North_America.construccion - 2; 
            }
            if(Sud_America.construccion <= 2){
                construccion1 = Sud_America.construccion = 0;
            }else{
                construccion1 = Sud_America.construccion = Sud_America.construccion - 2;
            }
            if(Oceania.construccion <= 2){
                construccion2 = Oceania.construccion = 0;
            }else{
                construccion2 = Oceania.construccion = Oceania.construccion - 2;
            }
            if(Asia.construccion <= 2){
                construccion3 = Asia.construccion = 0;
            }else{
                construccion3 = Asia.construccion = Asia.construccion - 2;
            }
            if(Africa.construccion <= 2){
                construccion4 = Africa.construccion = 0;
            }else{
                construccion4 = Africa.construccion = Africa.construccion - 2;
            }
            if(Europa.construccion <= 2){
                construccion5 = Europa.construccion = 0;
            }else{
                construccion5 = Europa.construccion = Europa.construccion - 2;
            }

            North_America.save({construccion: construccion});
            Sud_America.save({construccion: construccion1});
            Oceania.save({construccion: construccion2});
            Asia.save({construccion: construccion3});
            Africa.save({construccion: construccion4});
            Europa.save({construccion: construccion5});

        }else if(card.name == 'Caida De Servidores'){


            // ========== CONSTRUCCION ===========
            if(North_America.construccion <= 2){
                construccion = North_America.construccion = 0;
            }else{
                construccion = North_America.construccion = North_America.construccion - 2; 
            }
            if(Sud_America.construccion <= 2){
                construccion1 = Sud_America.construccion = 0;
            }else{
                construccion1 = Sud_America.construccion = Sud_America.construccion - 2;
            }
            if(Oceania.construccion <= 2){
                construccion2 = Oceania.construccion = 0;
            }else{
                construccion2 = Oceania.construccion = Oceania.construccion - 2;
            }
            if(Asia.construccion <= 2){
                construccion3 = Asia.construccion = 0;
            }else{
                construccion3 = Asia.construccion = Asia.construccion - 2;
            }
            if(Africa.construccion <= 2){
                construccion4 = Africa.construccion = 0;
            }else{
                construccion4 = Africa.construccion = Africa.construccion - 2;
            }
            if(Europa.construccion <= 2){
                construccion5 = Europa.construccion = 0;
            }else{
                construccion5 = Europa.construccion = Europa.construccion - 2;
            }


            // ======== INTELIGENCIA ==========
            if(North_America.inteligencia <= 2){
                inteligencia = North_America.inteligencia = 0;
            }else{
                inteligencia = North_America.inteligencia = North_America.inteligencia - 2; 
            }
            if(Sud_America.inteligencia <= 2){
                inteligencia1 = Sud_America.inteligencia = 0;
            }else{
                inteligencia1 = Sud_America.inteligencia = Sud_America.inteligencia - 2;
            }
            if(Oceania.inteligencia <= 2){
                inteligencia2 = Oceania.inteligencia = 0;
            }else{
                inteligencia2 = Oceania.inteligencia = Oceania.inteligencia - 2;
            }
            if(Asia.inteligencia <= 2){
                inteligencia3 = Asia.inteligencia = 0;
            }else{
                inteligencia3 = Asia.inteligencia = Asia.inteligencia - 2;
            }
            if(Africa.inteligencia <= 2){
                inteligencia4 = Africa.inteligencia = 0;
            }else{
                inteligencia4 = Africa.inteligencia = Africa.inteligencia - 2;
            }
            if(Europa.inteligencia <= 2){
                inteligencia5 = Europa.inteligencia = 0;
            }else{
                inteligencia5 = Europa.inteligencia = Europa.inteligencia - 2;
            }
            


        // =========== ORO ==========
        if(North_America.oro <= 200){
            oro = North_America.oro = 0;
        }else{
            oro = North_America.oro = North_America.oro - 200; 
        }
        if(Sud_America.oro <= 200){
            oro1 = Sud_America.oro = 0;
        }else{
            oro1 = Sud_America.oro = Sud_America.oro - 200;
        }
        if(Oceania.oro <= 200){
            oro2 = Oceania.oro = 0;
        }else{
            oro2 = Oceania.oro = Oceania.oro - 200;
        }
        if(Asia.oro <= 200){
            oro3 = Asia.oro = 0;
        }else{
            oro3 = Asia.oro = Asia.oro - 200;
        }
        if(Africa.oro <= 200){
            oro4 = Africa.oro = 0;
        }else{
            oro4 = Africa.oro = Africa.oro - 200;
        }
        if(Europa.oro <= 200){
            oro5 = Europa.oro = 0;
        }else{
            oro5 = Europa.oro = Europa.oro - 200;
        }

        North_America.save({construccion: construccion, inteligencia: inteligencia , oro: oro});
        Sud_America.save({construccion: construccion1, inteligencia: inteligencia1 , oro: oro1});
        Oceania.save({construccion: construccion2, inteligencia: inteligencia2 , oro: oro2});
        Asia.save({construccion: construccion3, inteligencia: inteligencia3 , oro: oro3});
        Africa.save({construccion: construccion4, inteligencia: inteligencia4 , oro: oro4});
        Europa.save({construccion: construccion5, inteligencia: inteligencia5 , oro: oro5});
    }

        req.flash('success_msg', 'Evento tirado con exito!');
        res.redirect('/ingame/events/');
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
        const game = await Game.findById('5fedf15fa1268c39d8229e47');
        game.players.push(req.user.id);
        
        game.save();
        user.save();
    }else if(codeClass == '823jsjdk'){
        const game = await Game.findById('5ffc9ddda5b1f82890d99841');
        user.class = 'SMX-T';
        game.players.push(req.user.id);

        game.save();
        user.save();
    }
    
    res.redirect('/ingame');
  });

// ========= CONSOLA EVENTOS ======= //

router.get('/ingame/events/', isAuthenticated, async (req, res) => {
    const events = await Events.find();
    const users = await User.findById(req.user.id);

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
              otros: documento.otros,
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
