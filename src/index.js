const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require ('method-override');
const session = require('express-session');
const { dir } = require('console');
const flash = require('connect-flash');
const passport = require('passport');
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage');
const { Z_PARTIAL_FLUSH } = require('zlib');
const { update } = require('./models/User');
const { v4: uuidv4 } = require('uuid');


const storage = multer.diskStorage({
    destination: path.join(__dirname, '/public/uploads/'),
    filename: (req, file, cb, filename) => {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});

// Initializations
const app = express();
require('./database');
require('./config/passport');


// Settings
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('views engine', '.hbs');

// Middlewares
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('__method'));
app.use(session({
    secret: 'mysecretapp',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(multer({
    storage: storage
}).single('file'));


app.use(flash());


// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.attack_msg = req.flash('attack_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});


// Routes
app.use(require('./routes/index'));
app.use(require('./routes/notes'));
app.use(require('./routes/users'));


//Static Files
app.use(express.static(path.join(__dirname, 'public')));


// Server is listenning
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});

