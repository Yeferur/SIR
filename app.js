const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const layout = require('express-ejs-layouts');
const port = 5000;
const app = express();

// Cargar variables de entorno
dotenv.config({ path: "./env/.env" });

// Ruta base
const BASE_URL = process.env.BASE_URL || ''; // Agrega BASE_URL a tu .env si es necesario

// Seteamos el motor de vistas
app.set('view engine', 'ejs');
app.use(layout);

// Seteamos la carpeta public
app.use(express.static('public'));

// Para procesar datos enviados desde formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Seteamos las cookies
app.use(cookieParser());

// Definimos la ruta base como una variable local
app.use((req, res, next) => {
    res.locals.baseUrl = BASE_URL;
    next();
});


// Llamar al router
app.use('/', require("./routes/router"));

app.use(function (req, res, next) {
    if (!req.user) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    }
    next();
});

require('./scheduler');

app.listen(port, () => {
    console.log('listening on port ' + port);
});
