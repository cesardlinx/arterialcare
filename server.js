const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Listening port
const port = process.env.PORT || 5000;


/**
 * Conexión a base de datos
 */

mongoose.connect('mongodb://localhost:27017/arterialcare', {
  useNewUrlParser: true
});

const db = mongoose.connection;

db.on('connected', () => console.log('Conexión exitosa a base de datos'));
db.on('error', (err) => {
  console.log('Se ha producido un error al intentar conectarse a la base de datos');
});

//OJO delete
app.use(cors());

// Middleware Body parser
app.use(bodyParser.json());

//Middleware para remover header X-Powered-By por seguridad
app.use(function (req, res, next) {
  res.removeHeader("X-Powered-By");
  next();
});

app.get('/', (req, res) => {
  res.send('working');
});

// Inicializa el servidor
app.listen(port, () => console.log('Servidor corriendo en puerto', port));
