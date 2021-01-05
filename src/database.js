const mongoose = require('mongoose');
const URI = 'mongodb+srv://usuario:user@bubblebytech.bgw8r.mongodb.net/test';

mongoose.connect(URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
.then(db => console.log('DB is conected'))
.catch(err => console.log(err));
