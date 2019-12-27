/**
 * Librerías
 */
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database.config');

// Puerto de escucha
const port = process.env.PORT || 3000;

/**
 * Conexión a base de datos
 */
// mongoose.Promise = require('bluebird');
mongoose.Promise = global.Promise;
mongoose.connect(config.database, {useMongoClient: true});

const db = mongoose.connection;

db.on('connected', () => console.log('Conexión exitosa a base de datos'));
db.on('error', (err) => {
  console.log('Se ha producido un error al intentar conectarse a la base de datos');
});

//OJO BORRAR LUEGO
app.use(cors());

/**
 * Uso de Middleware
 */

 // Middleware Body parser
 app.use(bodyParser.json());

// Middleware de la librería Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport.config')(passport);

//Middleware para remover header X-Powered-By por seguridad
app.use(function (req, res, next) {
  res.removeHeader("X-Powered-By");
  next();
});


/**
 * Rutas
 */
const pacientes = require('./routes/pacientes.routes');
app.use('/pacientes', pacientes);

const doctores = require('./routes/doctores.routes');
app.use('/doctores', doctores);

const existe = require('./routes/existe.routes');
app.use('/existe', existe);

const mediciones = require('./routes/mediciones.routes');
app.use('/mediciones', mediciones);

const estadisticas = require('./routes/estadisticas.routes');
app.use('/estadisticas', estadisticas);




/**
 * Declaración de carpeta del cliente web
 */
 app.use(express.static('client'));


// Asegura que todas las rutas sean redirigidas al index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});


 // Inicializa el servidor
 app.listen(port, () => console.log('Servidor corriendo en puerto', port));