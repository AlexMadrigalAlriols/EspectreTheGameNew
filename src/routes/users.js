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
const Entregas = require('../models/Entregas');
const Actividades = require('../models/Actividades');
const Skins = require('../models/Skins');
const Logros = require('../models/Logros');

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
                groupid: documento.groupid,
                class: documento.class,
                banner: documento.banner,
                subido: documento.subido,
                practica: documento.practica,
                character: documento.character
            }
          })
        }

        const userAdmin = userId.admin;
        const users = contexto.users;
        res.render('users/all-users.hbs', {users, userAdmin });
      });
  });

  router.get('/users/search/:id', isAuthenticated, async (req, res) => {
    const userId = await User.findById(req.user._id);
    const user = await User.findOne({_id: req.params.id});
    
    await User.find({email: user.email}).sort({name: 'desc'})
      .then(async documentos => {
        const contexto = {
            users: documentos.map(documento => {
            return {
                name: documento.name,
                _id: documento._id,
                email: documento.email,
                description: documento.description,
                group: documento.group,
                groupid: documento.groupid,
                class: documento.class,
                banner: documento.banner,
                subido: documento.subido,
                practica: documento.practica,
                character: documento.character
            }
          })
        }

        const userAdmin = userId.admin;
        const users = contexto.users;
        res.render('users/all-users.hbs', {users, userAdmin });
      });
  });

  router.post('/user/search/', async (req, res) => {
    const user = await User.findOne({email: req.body.email});

    if(user == null){
        req.flash('error_msg', 'No se ha encontrado nadie con ese email.')
        res.redirect('/users/all-users');
    }else{
        res.redirect('/users/search/' + user._id);
    }
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
    var game = await Game.findOne({classtag: req.user.class});

    var { name, email, description, group } = req.body;
    
    user.name = name;
    user.email = email;
    user.description = description;
    if(req.user.admin == true){
        user.group = group;
    }else{
        user.group = req.user.group;
    }
    var groupUser = await Group.findOne({name: req.body.group, game: game._id});
    var indexGroup = await groupUser.users.indexOf(req.params.id);

    if(indexGroup > -1){
        console.log('Esta en el grupo ya');
    }else{
        await groupUser.users.push(req.params.id);
        const nameGroup = groupUser.name;

        if(req.body.group == 'North_America'){
            user.North_America = true;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = false;
            var group = await Group.findOne({name: 'North_America', game: game._id});
            user.groupid = group._id;

        }else if(req.body.group == 'Sud_America'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = true;
            var group = await Group.findOne({name: 'Sud_America', game: game._id});
            user.groupid = group._id;

        }else if( nameGroup == 'Oceania'){
            user.North_America = false;
            user.Oceania = true;
            user.Asia = false;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = false;
            var group = await Group.findOne({name: 'Oceania', game: game._id});
            user.groupid = group._id;

        }else if( nameGroup == 'Asia'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = true;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = false;
            var group = await Group.findOne({name: 'Asia', game: game._id});
            user.groupid = group._id;

        }else if(nameGroup == 'Europa'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = false;
            user.Europa = true;
            user.SinGroup = false;
            user.Sud_America = false;
            var group = await Group.findOne({name: 'Europa', game: game._id});
            user.groupid = group._id;

        }else if(nameGroup == 'Africa'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = true;
            user.Europa = false;
            user.SinGroup = false;
            user.Sud_America = false;
            var group = await Group.findOne({name: 'Africa', game: game._id});
            user.groupid = group._id;

        }else if(nameGroup == 'SinGroup'){
            user.North_America = false;
            user.Oceania = false;
            user.Asia = false;
            user.Africa = false;
            user.Europa = false;
            user.SinGroup = true;
            user.Sud_America = false;
            var group = await Group.findOne({name: 'SinGroup', game: game._id});
            user.groupid = group._id;

        }

        await groupUser.save();
    }

    if(req.file == null) {
        user.banner = req.user.banner;


        await user.save();
        req.flash('success_msg', 'Profile Updated');
        res.redirect('/ingame/');
    }else{
        user.banner = '/uploads/' + req.file.filename;

        await user.save();
        req.flash('success_msg', 'Profile Updated');
        res.redirect('/ingame/');
    }
});

  router.delete('/users/delete/:id', isAuthenticated, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'User Deleted Successfully');
    res.redirect('/users/all-users');
  });

  router.put('/users/nota/:id', isAuthenticated, async (req, res) => {
    var group = await Group.findOne({_id: req.params.id});

    group.nota = req.body.nota;
    if(group.nota >= 0.00 && group.nota < 5.00){
        group.diamantes = group.diamantes + 0;

    }else if(group.nota >= 5.00 && group.nota < 7.00){
        group.diamantes = group.diamantes + 1;
    }else if(group.nota >= 8.00 && group.nota < 9.00){
        group.diamantes = group.diamantes + 2;
    }else if(group.nota == 10){
        group.diamantes = group.diamantes + 3;
    }
    await group.save();

    req.flash('success_msg', 'Nota puesta con exito!');
    res.redirect('/ingame/all-groups/');
  });

router.get('/users/logout', (req, res) => {
    req.logOut();
    res.redirect('/')
});

router.get('/ingame', isAuthenticated, async (req, res) =>{
    var user = await User.findById(req.user._id);
    var userclass = await Game.findOne({classtag: user.class});
    if(userclass != null){
            if(req.user.SinGroup == true){
                req.flash('success_msg', 'Tienes que esperar para que tu profesor te coloque en un grupo.')
                res.redirect('/');
            }else{
                var group = await Group.findOne({_id: user.groupid});

                if(group.Ataqued == true){ 
                req.flash('attack_msg', 'Estas siendo atacado usa una carta de TIER ' + group.TierOfAttacked + ' para poderte defender.');
                res.redirect('/ingame/cards/');

                }else{
                    await Actividades.find({class: req.user.class}).sort({date: 'desc'})
                    .then(async documentos => {
                    const contexto = {
                        actividad: documentos.map(documento => {
                        return {
                            name: documento.name,
                            _id: documento._id,
                            descripcion: documento.descripcion,
                            entregados: documento.entregados,
                            class: documento.class,
                        }
                        })
                    }
                    var user = await User.findById(req.user._id);
                    var group = await Group.findOne({_id: req.user.groupid});
                    var game = await Game.findOne({classtag: user.class}); 
                    var actividades = contexto.actividad;
                    res.render('layouts/mapa.hbs', { game, user, group, actividades });
                    });
        }
    }
    }else{
        res.redirect('/code');
    }
});

router.get('/ingame/nolink', isAuthenticated, async (req, res) => {
    req.flash('error_msg', 'Tu profesor aun no ha puesto un link para la clase virtual!');
    console.log('no link');
    res.redirect('/ingame');
});

router.get('/ingame/gameSettings', isAuthenticated, async (req, res) => {
    var game = await Game.findOne({classtag: req.user.class});

    if(req.user.admin == true){
        res.render('./game/gameSettings.hbs', {game});
    }else{
        res.redirect('/ingame');
    }
});

router.put('/ingame/gameSettings', isAuthenticated, async (req, res, file) => {
    var lastGame = await Game.findOne({classtag: req.user.class});
    var group = await Group.findOne({_id: req.user.groupid});

    const linkmeet = req.body.linkmeet;

    if(req.body.mapa == "ningunoElegido"){
        var mapa = lastGame.mapa;
    } else{
        var mapa = req.body.mapa;
    }

    await Game.findByIdAndUpdate(lastGame._id, { linkmeet, mapa });
    await group.save();
    res.redirect('/ingame');
});


// ========= GROUPS =============== //

router.get('/ingame/all-groups/', isAuthenticated, async (req, res) => {
    const userId = await User.findById(req.user._id);
    const game = await Game.findOne({classtag: req.user.class});

    await Group.find({game: game._id}).sort({name: 'desc'})
      .then(async documentos => {
        const contexto = {
            groups: documentos.map(documento => {
            return {
                name: documento.name,
                _id: documento._id,
                oro: documento.oro,
                inteligencia: documento.inteligencia,
                construccion: documento.construccion,
                subido: documento.subido,
                practica: documento.practica,
                nota: documento.nota,
                notaFinal: documento.notaFinal,
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

    var group = await Group.findOne({_id: req.user.groupid});
    console.log(group);
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
    var group = await Group.findOne({_id: req.user.groupid});

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
    var group = await Group.findOne({_id: req.user.groupid});
    
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
    var esSkin = false;
    const bundle = await Bundle.findOne({_id: req.params.id});

    var group = await Group.findOne({_id: req.user.groupid});

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
            res.render('cards/bundle-opened.hbs', { group, cartaTocada,descripcion, esSkin });
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
            res.render('cards/bundle-opened.hbs', { group, cartaTocada, descripcion, esSkin });
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

            res.render('cards/bundle-opened.hbs', { group, cartaTocada, descripcion, esSkin });
        
        }else if(group.diamantes < 7){
            req.flash('error_msg', 'No tienes los suficientes diamantes para comprar este sobre!');
            res.redirect('/ingame/bundles/');
        }
    }else if(bundle.name == 'Sobre Skins'){
        if(group.diamantes >= 3){
            group.diamantes = group.diamantes - 3;
            var numRand = Math.floor(Math.random() * 15);
            var cartaTocada = await Skins.findOne({__v: numRand});

            var user = await User.findById(req.user._id);

            var descripcion = "Te ha tocado la Skins de " + cartaTocada.name;
            cartaTocada.usuarios.push(user._id);
            cartaTocada.save();

            var esSkin = true;

            res.render('cards/bundle-opened.hbs', { group, cartaTocada, descripcion, esSkin });
        }else if(group.diamantes < 3){
            req.flash('error_msg', 'No tienes los suficientes diamantes para comprar este sobre!');
            res.redirect('/ingame/bundles/');
        }
    }
  });

router.put('/cards/buy/:id', isAuthenticated, async (req, res) => {
    const card = await Card.findOne({_id: req.params.id});
    var group = await Group.findOne({_id: req.user.groupid});

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
    var group = await Group.findOne({_id: req.user.groupid});

    res.render('cards/cards-select.hbs', { group });
  });

  router.get('/cards/use/:id', isAuthenticated, async (req, res) => {
    const card = await Card.findOne({_id: req.params.id});
    const events = await Events.find();
    const user = await User.findById(req.user.id);

    var group = await Group.findOne({_id: req.user.groupid});

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

    var group = await Group.findOne({_id: req.user.groupid});

    const indexCarta = await group.cartas.indexOf(req.params.id);
    if(indexCarta > -1){
        user.cartasusadas = user.cartasusadas + 1;
        await user.save();
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
            await group.save();
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
            var game = await Game.findOne({classtag: req.user.class});
            var groupAtacado = await Group.findOne({name: req.body.groupAttac, game: game._id});
    
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
                    if(req.body.groupAttac.inteligencia < 3){
                        groupAtacado.Ataqued = true;
                        var inteligencia = group.inteligencia + 3;
                        req.body.groupAttac.inteligencia - 3;
                        group.cartas.splice(indexCarta);
                    }else{
                        req.flash('error_msg', 'El equipo atacado no tiene 3 de inteligencia')
                        res.redirect('/ingame/cards');
                    }
                }else{
                    req.flash('error_msg', 'No tienes sufficientes puntos de inteligencia');
                    res.redirect('/ingame/cards');
                }
            }

            groupAtacado.save();
            group.save();
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
    const user = await User.findById(req.user.id);
    if(user.class == 'SinAsignar'){
        if(user.rol == 'Student'){
            var teacher = false;
        }else{
            var teacher = true;
        }
        res.render('users/classCode.hbs', { user, teacher });
    }else{
        res.redirect('/ingame');
    }
  });

  router.put('/code', isAuthenticated, async (req, res) => {

    const user = await User.findOne({_id: req.user.id});
    const codeClass = req.body.codeClass;
    var game = await Game.findOne({code: codeClass});
    if(codeClass == game.code){
        user.class = game.classtag;
        game.players.push(req.user._id);
        
        await game.save();
        await user.save();
        res.redirect('/ingame');
    }else{
        req.flash('error_msg', 'No existe ninguna clase con este codigo!');
        res.redirect('/code');
    }
  });

// ========= CONSOLA EVENTOS ======= //

router.get('/ingame/events/', isAuthenticated, async (req, res) => {
    const events = await Events.find();
    const users = await User.findById(req.user.id);

    await Events.find({class: users.class}).sort({date: 'desc'})
    .then(async documentos => {
      var contexto = {
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
        var events = contexto.events;
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

// ============ SELECT PLAYER ========= //
router.get('/ingame/character', isAuthenticated, async (req, res) => {
    const user = User.findById(req.user.id);

    await Skins.find({usuarios: req.user.id})
    .then(async documentos => {
      const contexto = {
        skins: documentos.map(documento => {
          return {
              name: documento.name,
              _id: documento._id,
              img: documento.img,
              usuarios: documento.usuarios
          }
        })
      }
      var skins = contexto.skins;
      res.render('tablero/selectplayer.hbs', { skins, user });
    });
});

router.put('/ingame/character', isAuthenticated, async (req, res) => {
    var user = await User.findById(req.user.id);

    user.character = req.body.characterSelect;
    await user.save();
    res.redirect('/ingame');
});

// ============= BOARD GAME =========
router.get('/ingame/board', isAuthenticated, async (req, res) => {
    var group = await Group.findOne({_id: req.user.groupid});  

    await Actividades.find({class: req.user.class}).sort({date: 'desc'})
    .then(async documentos => {
      const contexto = {
        actividad: documentos.map(documento => {
          return {
              name: documento.name,
              _id: documento._id,
              descripcion: documento.descripcion,
              entregados: documento.entregados,
              class: documento.class,
              diamax: documento.diamax,
              mesmax: documento.mesmax
          }
        })
      }
      var actividades = contexto.actividad;
      var logro = await Logros.findById("60316aa1437b6f1a940b4eb8");
      var user = await User.findById(req.user.id);
      var indexLogro = await user.logros.indexOf(logro._id);

      if(indexLogro > -1){
        res.render('tablero/board.hbs', { user, group,actividades });
      }else{
        logro.players.push(user._id);
        user.logros.push(logro._id);
        user.logrosconseguidos++; 
        await user.save();
        await logro.save();

        req.flash('success_msg', 'Has conseguido el Logro: ' + logro.name);
        res.redirect('/ingame/board');
      }
    });

});

router.get('/ingame/boardgame/:id', isAuthenticated, async (req, res) => {
    var user = await User.findById(req.user.id);
    var group = await Group.findOne({_id: req.user.groupid}); 

    const actividad = await Actividades.findOne({_id: req.params.id});
    if(actividad.individual){
        var indexEntrega = await Entregas.findOne({user: req.user._id, actividad: actividad._id});
    }else{
        var indexEntrega = await Entregas.findOne({group: group._id, actividad: actividad._id});
    }

    if(indexEntrega == null){
        var entregado = false;
        var entrega = "";
    }else{
        var entregado = true;
        var entrega = indexEntrega;
    }

    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    var pasadolimite = false;
    if(actividad.mesmax != 0 && actividad.diamax != 0){
        if(actividad.mesmax == month){
            if(actividad.diamax < day){
                var pasadolimite = true;
            }else{
                var pasadolimite = false;
            }
        }else if(actividad.mesmax < month){
            var pasadolimite = true;
        }
    }else{
        var pasadolimite = false;
    }

    res.render('tablero/boardgame.hbs', {user, group, actividad, entregado, entrega, pasadolimite});
});
router.get('/ingame/boardactivity/:id', isAuthenticated, async (req, res) => {
    var user = await User.findById(req.user.id);
    var practica = await Actividades.findById(req.params.id);
    var group = await Group.findOne({_id: req.user.groupid});

    res.render('tablero/entregaPractica.hbs', {user, group, practica});
});

router.get('/ingame/edit-activity/:id', isAuthenticated, async (req, res) => {
    var user = await User.findById(req.user.id);
    var group = await Group.findOne({_id: req.user.groupid}); 

    const actividad = await Actividades.findById(req.params.id);
    res.render('game/editActividades.hbs', {user, group, actividad});
});

router.put('/ingame/edit-activity/:id', isAuthenticated, async (req, res, file) => {
    var actividad = await Actividades.findById(req.params.id);

    if(req.file == null){
        actividad.recursosAdicionales = actividad.recursosAdicionales;
    }else{
        actividad.recursosAdicionales = req.file.filename;
    }
    if(req.body.typeActivity == 'individual'){
        var individual = true;
    }else{
        var individual = false;
    }

    if(req.body.bossSelect != null){
        actividad.boss = req.body.bossSelect;
        actividad.dragon = false;
    }

    if(req.body.bossSelect == '/img/bosses/dragon.png'){
        actividad.dragon = true;
    }

    actividad.name = req.body.name;
    actividad.descripcion = req.body.descripcion;
    actividad.individual = individual;
    actividad.diamax = req.body.diamax;
    actividad.mesmax = req.body.mesmax;
    await actividad.save();

    res.redirect('/ingame/boardgame/' + actividad._id);
});

router.get('/ingame/new-activity/', isAuthenticated, async (req, res) => {
    var user = await User.findById(req.user.id);
    var group = await Group.findOne({_id: req.user.groupid}); 

    res.render('game/actividadesSettings.hbs', {user, group});
});

  router.delete('/ingame/activity/:id', isAuthenticated, async (req, res) => {
    await Actividades.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Activity Deleted Successfully');
    res.redirect('/ingame');
  });

  router.delete('/ingame/activity/delete/:id', isAuthenticated, async (req, res) => {
    await Entregas.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Entrega Deleted Successfully');
    res.redirect('/ingame');
  });

router.put('/ingame/new-activity', isAuthenticated, async (req, res, file) => {
    var game = await Game.findOne({classtag: req.user.class});

    if(req.file == null){
        var recursosAdicionales = "sinRecursos";
    }else{
        var recursosAdicionales = req.file.filename;
    }

    if(req.body.typeActivity == 'individual'){
        var individual = true;
    }else{
        var individual = false;
    } 
    if(req.body.estest == 'test'){
        var estest = true;
    }else{
        var estest = false;
    }
    const newActivity = new Actividades({name: req.body.name, descripcion: req.body.descripcion, recursosAdicionales, individual ,boss: req.body.bossSelect, estest, class: req.user.class, diamax: req.body.diamax, mesmax: req.body.mesmax});
    await newActivity.save();
    game.practicasSubidas = game.practicasSubidas + 1;
    game.save();

    res.redirect('/ingame/boardgame/' + newActivity._id);
});
router.get('/ingame/new-test/', isAuthenticated, async (req, res) => {
    var user = await User.findById(req.user.id);
    var group = await Group.findOne({_id: req.user.groupid}); 

    res.render('game/actividadesTestCreate.hbs', {user, group});
});

router.put('/ingame/boardactivity/:id', isAuthenticated, async (req, res, file) => {
    var user = await User.findById(req.user.id);
    var practica = await Actividades.findById(req.params.id);
    var group = await Group.findOne({_id: req.user.groupid}); 

    if(practica.individual){
        var indexEntrega = await Entregas.findOne({actividad: req.params.id, user: req.user._id});
    }else{
        var indexEntrega = await Entregas.findOne({actividad: req.params.id, group: group._id});
    }

    if(indexEntrega == null){
        if(req.file == undefined){
            var entrega = "";
        }else{
            var entrega = req.file.filename;
        }
        if(practica.individual){
            const newEntrega = new Entregas({user: req.user._id, actividad: req.params.id, comentarios: req.body.comments, entrega: entrega, actividadname: practica.name});
            
            await newEntrega.save();
            await practica.entregados.push(newEntrega._id);
        }else{
            const newEntrega = new Entregas({group: group._id, actividad: req.params.id, comentarios: req.body.comments, entrega: entrega, actividadname: practica.name});
            await newEntrega.save();
            await practica.entregados.push(newEntrega._id);
        }
        
        await practica.save();
    
    
        res.redirect('/ingame/boardgame/' + req.params.id);
    }else{
        req.flash('error_msg', 'Ya has entregado esta practica!');
        res.redirect('/ingame/boardgame/' + req.params.id);
    }
   
});

router.put('/entrega/:id', isAuthenticated, async (req, res, file) => {
    var entrega = await Entregas.findById(req.params.id);

    if(entrega.user != undefined){
        var user = await User.findById(entrega.user);
        var group = await Group.findOne({_id: req.user.groupid}); 
        var game = await Game.findOne({classtag: req.user.class});
    }else{
        var user = await User.findById(entrega.user);
        var game = await Game.findOne({classtag: req.user.class});
        var group = await Group.findOne({_id: entrega.group});
    }

    entrega.nota = req.body.nota;

    if(entrega.nota >= 0.00 && entrega.nota < 5.00){
        group.diamantes = group.diamantes + 0;

    }else if(entrega.nota >= 5.00 && entrega.nota < 7.00){
        
        group.diamantes = group.diamantes + 1;
    }else if(entrega.nota >= 8.00 && entrega.nota < 9.00){

        group.diamantes = group.diamantes + 2;
    }else if(entrega.nota == 10){
        group.diamantes = group.diamantes + 3;
    }
    await group.save();
    entrega.save();
    group.notaFinal = group.notaFinal + req.body.nota / game.practicasSubidas;

    group.save();
    
    if(entrega.individual){
        req.flash('success_msg', 'Nota puesta con exito!');
        res.redirect('/users/all-users/');
    }else{
        req.flash('success_msg', 'Nota puesta con exito!');
        res.redirect('/ingame/all-groups/');
    }
});

router.get(`/group/:id`, isAuthenticated, async (req, res) => {
    
    if(req.user.admin){
        var user = await User.findById(req.user.id);
        var group = await Group.findOne({_id: req.params.id});
    
        await Entregas.find({group: group._id}).sort({date: 'desc'})
        .then(async documentos => {
          const contexto = {
            entregas: documentos.map(documento => {
              return {
                  nota: documento.nota,
                  _id: documento._id,
                  entrega: documento.entrega,
                  comentarios: documento.comentarios,
                  actividadname: documento.actividadname,
                  actividad: documento.actividad,
                  nombre: group.name
              }
            })
          }
          var entregas = contexto.entregas;
          res.render('groups/actividades.hbs', { user, group,entregas });
        });
    }else{
        req.flash('error_msg', 'You are not admin!');
        res.redirect('/ingame');
    }

});

router.get(`/user/:id`, isAuthenticated, async (req, res) => {
    if(req.user.admin){
        var user = await User.findById(req.user.id);
        var group = await Group.findOne({_id: user.groupid});
    
        await Entregas.find({user: req.params.id}).sort({date: 'desc'})
        .then(async documentos => {
          const contexto = {
            entregas: documentos.map(documento => {
              return {
                  nota: documento.nota,
                  _id: documento._id,
                  entrega: documento.entrega,
                  comentarios: documento.comentarios,
                  actividadname: documento.actividadname,
                  actividad: documento.actividad,
                  nombre: user.name
              }
            })
          }
          var entregas = contexto.entregas;
          res.render('users/actividades.hbs', { user, group,entregas });
        });
    }else{
        req.flash('error_msg', 'You are not admin!');
        res.redirect('/ingame');
    }

});

// ===================== LOGROS ===========================
router.get('/ingame/logros', isAuthenticated, async (req, res) => {
    var group = await Group.findOne({_id: req.user.groupid});

    await Logros.find({players: req.user._id}).sort({date: 'desc'})
    .then(async documentos => {
      const contexto = {
          logros: documentos.map(documento => {
          return {
              name: documento.name,
              _id: documento._id,
              recompensaexp: documento.recompensaexp,
              img: documento.img,
              recompensa: documento.recompensa
          }
        })
      }
      var logros = contexto.logros;
      var userId = await User.findById(req.user._id);
      res.render('logros/all-logros.hbs', { logros, userId, group });
    });
});

router.get('/ingame/all-logros', isAuthenticated, async (req, res) => {
    var group = await Group.findOne({_id: req.user.groupid});

    await Logros.find().sort({date: 'desc'})
    .then(async documentos => {
      const contexto = {
          logros: documentos.map(documento => {
          return {
              name: documento.name,
              _id: documento._id,
              recompensaexp: documento.recompensaexp,
              img: documento.img,
              recompensa: documento.recompensa
          }
        })
      }
      var logros = contexto.logros;
      var userId = await User.findById(req.user._id);
      res.render('logros/todoslogros.hbs', { logros, userId, group });
    });
});

router.put('/logro/:id', isAuthenticated, async (req, res, file) => {
    var logro = await Logros.findById(req.params.id);
    var user = await User.findById(req.user._id);

    var indexLogro = logro.players.indexOf(req.user._id);
    if(indexLogro > -1){
        logro.players.splice(indexLogro, 1);
        logro.save();

        user.exp = user.exp + logro.recompensaexp;
        if(user.exp >= 100){
            user.exp = 0;
            user.level++; 
            user.save();
            req.flash('success_msg', 'Has subido de nivel!');
            res.redirect('/ingame/logros');
        }else{
            user.save();
            req.flash('success_msg', 'Has recogido la recompensa del logro!');
            res.redirect('/ingame/logros');
        }
        
        

    }else{
        req.flash('error_msg', 'Aun no tienes ese logro completado!');
        res.redirect('/ingame/logros');
    }
});

  // ===== NEW CLASS ======= //
  router.get('/newclass', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.user.id);
    if(user.rol == 'Teacher'){
        const numRand = Math.floor(Math.random() * 18);
        const numRand2 = Math.floor(Math.random() * 12);
        const numRand3 = Math.floor(Math.random() * 19);
        const code = numRand + "D" + numRand2 + "H" + numRand3 + "L";

        const game = await Game.findOne({code: code});

        if(game == null){
            res.render('game/newGame.hbs', { user, code });
        }else{
            const numRand = Math.floor(Math.random() * 18);
            const numRand2 = Math.floor(Math.random() * 12);
            const numRand3 = Math.floor(Math.random() * 19);
            const code = numRand + "F" + numRand2 + "H" + numRand3 + "T";
            res.render('game/newGame.hbs', { user, code });
        }
    }
  });

  router.post('/newclass/:id', isAuthenticated, async (req, res) => {
    var user = await User.findById(req.params.id);
    const {name, code, classtag} = req.body;
    const newClass = new Game({name, code, classtag, admin: req.params.id});
    newClass.players.push(req.params.id);
    user.class = classtag;
    user.group = 'Game Master';
    user.Oceania = true;
    user.admin = true;
    user.SinGroup = false;
    // ========== CREAR GRUPOS PARA NEW CLASS ==============
    // ===== OCEANIA ====
    const cartas = ['5ffb2e2fcd2b9a11c4a4bbae'];
    const newGroup = new Group({name: "Oceania", cartas, game: newClass._id});
    await newGroup.save();
    // === ASIA ====
    const carta1 = ['5ffb2e47cd2b9a11c4a4bbb0'];
    const newGroup1 = new Group({name: "Asia", cartas: carta1, game: newClass._id});
    await newGroup1.save();
    // === Africa ===
    const carta2 = ['5ffb2e67cd2b9a11c4a4bbb1'];
    const newGroup2 = new Group({name: "Africa", cartas: carta2, game: newClass._id});
    await newGroup2.save();
    // === Europa ===
    const carta3 = ['5ffb2e3ccd2b9a11c4a4bbaf'];
    const newGroup3 = new Group({name: "Europa", cartas: carta3, game: newClass._id});
    await newGroup3.save();

    // === North America ===
    const carta4 = ['5ffb2d59cd2b9a11c4a4bbac'];
    const newGroup4 = new Group({name: "North_America", cartas: carta4, game: newClass._id});
    await newGroup4.save();

    // === Sud America ===
    const carta5 = ['5ffb2e13cd2b9a11c4a4bbad'];
    const newGroup5 = new Group({name: "Sud_America", cartas: carta5, game: newClass._id});
    await newGroup5.save();


    await newClass.groups.push(newGroup._id);
    await newClass.groups.push(newGroup1._id);
    await newClass.groups.push(newGroup2._id);
    await newClass.groups.push(newGroup3._id);
    await newClass.groups.push(newGroup4._id);
    await newClass.groups.push(newGroup5._id);
    await newClass.save();
    await user.save();
    res.redirect('/ingame');
});
module.exports = router;
