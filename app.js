const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const layout = require('express-ejs-layouts');
const port = 3000;
const app = express();

// Seteamos el motor de vistas
app.set('view engine', 'ejs');
app.use(layout);

//Seteamos la carpeta public
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + 'public'));

// Para procesar datos enviados desde formularios
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// seteamos las variables de entorno
dotenv.config({path: "./env/.env"});

// seteamos las cookies
app.use(cookieParser());

//llamar al router
app.use('/', require("./routes/router"));

app.use(function(req, res, next){
    if(!req.user)
    res.header('Cache-Control', 'private, no-cache, no.store, must-revalidate');
    next();
})

app.listen(port, () => {
    console.log('listening on port ' + port);
})