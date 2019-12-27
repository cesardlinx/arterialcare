const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);
const axios = require('axios');
var tokenClient;
var estado = false;

/*Configuración Comunicación serial*/
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const regex = /^\d{2,3},\d{2,3},\d{2,3}$/;
const puerto = process.argv[2]; // node app COM7
const port = new SerialPort(puerto, { baudRate: 19200 });
const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

/*Apertura de puerto serial*/
port.on('open', () => {
  console.log('Conexión abierta');
});

// Puerto http de escucha
const portHTTP = process.env.PORT || 8988;


/**
 * Conexión y recibimiento de token
 */
io.on('connection', socket => {
  const url = 'http://localhost:3000';

  socket.emit('coneccion', { sensor: false });

  socket.on('token', token => {
    let tokenTemp = token.substring(1, token.length - 1);
    tokenClient = `Bearer ${tokenTemp}`;
  });

  socket.on('disconnect', function () {
    tokenClient = '';
  });

});




/**
 * Realizar medición
 */
parser.on('data', data => {
  if (regex.test(data)) {
    let presionArr = data.split(",");
    let medicion = {
      fechaHora: new Date(),
      presionSistolica: presionArr[0],
      presionDiastolica: presionArr[1],
      pulso: presionArr[2]
    };
    const axiosInstance = axios.create({
      baseURL: process.env.HOSTURL || 'http://localhost:3000',
      headers: { Authorization: tokenClient },
    });
    const headers = {
      'Content-Type': 'application/json',
    }
    const url = '/mediciones/importar';
    const method = 'POST';
    
    axiosInstance({ method, url, data: medicion, headers })
      .then(function (response) {
        io.sockets.emit('finalizado', medicion);
      })
      .catch(function (error) {
        io.sockets.emit('error', { sensor: false });
      });
  } else {
    estado = !estado;
    if (estado) {
      io.sockets.emit('medicion', { sensor: true });
    }    
  }
});


// Inicializa el servidor
server.listen(portHTTP, () => console.log('Servidor corriendo en puerto', portHTTP));

/*Ejecutar como node app COM7*/