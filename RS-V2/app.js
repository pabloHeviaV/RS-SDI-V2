// Módulos
var express = require('express');
var app = express();

var expressSession = require('express-session');
app.use(expressSession({secret: 'abcdefg', resave: true, saveUninitialized: true}));
var crypto = require('crypto');

var swig = require('swig');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    console.log("routerUsuarioSession");
    if (req.session.usuario) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : " + req.session.destino);
        res.redirect("/login");
    }
});

//Aplicar routerUsuarioSession
//TODO poner urls privadas

app.use(express.static('public'));

// Variables
app.set('port', 8081);
app.set('db', 'mongodb://user:pass@ds159509.mlab.com:59509/rs');
app.set('clave', 'abcdefg');
app.set('crypto', crypto);

//Rutas/controladores por lógica
//TODO

app.get('/', function (req, res) {
    res.redirect('/login');
})

app.use(function (err, req, res, next) {
    console.log("Error producido: " + err); //we log the error in our db
    if (!res.headersSent) {
        res.status(400);
        res.send("Recurso no disponible");
    }
});

// lanzar el servidor
app.listen(app.get('port'), function () {
    console.log("Servidor activo");
})