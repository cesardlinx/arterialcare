const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Paciente = require('../models/paciente.model');
const config = require('../config/database.config');
const permisos = require('../config/permisos.config');
const passport = require('passport');
const axios = require('axios');
const queryString = require('query-string');

// Express Validator
const { body, validationResult} = require('express-validator/check');
const { matchedData } = require('express-validator/filter');


/**
 * Registro de Pacientes
 */
router.post('/registrar', [

  // Validaciones
  body('edad').not().isEmpty().isInt({min: 18, max: 100})
  
  // Almacenamiento en base de datos
], async (req, res) => {

  const errores = validationResult(req);

  if (errores.isEmpty()) {
    
    try {     
      /*Verificación de Captcha*/
      const axiosInstance = axios.create({
        baseURL: 'https://www.google.com'
      });
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
      const method = 'POST';
      const url = '/recaptcha/api/siteverify';
      
      const data = queryString.stringify({
        secret: config.recaptchaSecret,
        response: req.body.recaptcha
      });
      
      let recaptchaValid = await axiosInstance({ method, url, data, headers });        
    
      if (recaptchaValid.data.success === true) {
        pacienteTemp = {
          nombre: req.body.nombre,
          apellido: req.body.apellido,
          edad: req.body.edad,
          sexo: req.body.sexo,
          peso: req.body.peso,
          altura: req.body.altura,
          correo: req.body.correo,
          doctor: req.body.doctor,
          contrasena: req.body.contrasena,
          fechaRegistro: new Date(),
          fechaUltimaContrasena: new Date()
        };
      } else {
        
        return res.status(400).json({ success: false, msg: "Fallo al registrar paciente" });        
      }
      /*Hash de contraseña y almacenamiento de usuario*/

      let hash = await bcrypt.hash(pacienteTemp.contrasena, 10);
      pacienteTemp.contrasena = hash;
      nuevoPaciente = new Paciente(pacienteTemp);
      let paciente = await nuevoPaciente.save();

      /*Envío del correo*/
      const token = jwt.sign({
        iss: "arterial-care",
        sub: paciente._id,
        iat: new Date().getTime(),
        exp: new Date().setTime(new Date().getTime() + 24 * 3600 * 1000 * 7)
      }, config.emailSecret);

      const bienvenida = (paciente.sexo === 'Masculino') ? 'Bienvenido' : 'Bienvenida' 
      
      config.transport.sendMail({
        to: paciente.correo,
        subject: `${bienvenida} a Arterialcare`,
        html: `<p>${bienvenida} ${paciente.nombre} a Arterialcare,</p>
        </p>Para completar el proceso de verificación de su correo haga click en el link a continuación:
        <a href="http://localhost:4200/ingreso/paciente/${token}">https://arterialcare.herokuapp.com/paciente/${token}</a></p>
        <p>Para protección de su cuenta, el anterior link solo es válido durante una semana.</p>.`
      });      
      /*Hasta aqui el envío de correo */


      res.status(200).json({ success: true, msg: "Paciente creado" });  
    } catch (error) {  
      
      return res.status(400).json({ success: false, msg: "Fallo al registrar paciente" });
    }

    // En caso de no cumplir las validaciones
  } else {
    
    return res.status(400).json({ success: false, msg: "El paciente no cumple con el esquema" });    
  }  
  
});

/**
 * Confirmación de correo
 */
router.get('/confirmar/:token', async (req, res) => {
  const token = req.params.token;
  try {
    const paciente = jwt.verify(token, config.emailSecret);
    await Paciente.findByIdAndUpdate({ _id: paciente.sub }, {confirmado: true}).exec();
    return res.status(200).json({success: true});
  } catch (error) {
    return res.status(400).json({success: false});   
  }
});

/**
 * Autenticación de Pacientes
 */
router.post('/autenticar', [
  //validaciones
  body('usuario').not().isEmpty().isEmail().isLength({ max: 200 }),
  body('contrasena').not().isEmpty().isLength({ min: 6, max: 50 })

], async (req, res) => {

  const errores = validationResult(req);

  if (errores.isEmpty()) {

    const usuario = req.body.usuario;
    const contrasena = req.body.contrasena;

    try {
      /*Verificación de Captcha*/
      if (req.body.recaptcha) {
        const axiosInstance = axios.create({
          baseURL: 'https://www.google.com'
        });
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
        const method = 'POST';
        const url = '/recaptcha/api/siteverify';

        const data = queryString.stringify({
          secret: config.recaptchaSecret,
          response: req.body.recaptcha
        });

        let recaptchaValid = await axiosInstance({ method, url, data, headers });
        if (recaptchaValid.data.success === false) {
          return res.status(400).json({ success: false, msg: "Fallo de autenticación" });
        }
      }
      /*Autenticacion*/
      let user = await Paciente.findOne({correo: usuario}).exec();
      if (!user) {
        res.status(404).json({ success: false, msg: "Paciente no encontrado" });
        return false;
      }
      let comparacion = await bcrypt.compare(contrasena, user.contrasena);
      if (comparacion === true) {
        const token = jwt.sign({
          iss: "arterial-care",
          sub: user._id,
          role: "paciente",
          iat: new Date().getTime(),
          exp: new Date().setTime(new Date().getTime() + 24*3600*1000)
        }, config.secret);
        return res.status(200).json({ success: true, token: token });
      } else {
        return res.status(404).json({ success: false, msg: "Paciente no encontrado" });          
      }
    } catch (error) {      
      return res.status(404).json({ success: false, msg: "Paciente no encontrado" });          
    }
  
    // En caso de no pasar las validaciones
  } else {
    return res.status(404).json({ success: false, msg: "El paciente no existe" });
  }

});

/**
 * Obtener datos de paciente
 */
router.get('/:id', passport.authenticate('jwt', { session: false }), permisos.pacienteDoctor, async (req, res) => {
  const id = req.params.id;
  
  try {
    let paciente = await Paciente.findById({_id: id}).populate('doctor', 'nombre apellido nombreCompleto').exec();

    pacienteTemp = {
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      edad: paciente.edad,
      sexo: paciente.sexo,
      correo: paciente.correo
    };

    if (paciente.peso) pacienteTemp.peso = paciente.peso;
    if (paciente.altura) pacienteTemp.altura = paciente.altura;

    if (req.user._type === 'paciente') {
      if (paciente.doctor) {
        pacienteTemp.doctorNombre = paciente.doctor.nombreCompleto;
        pacienteTemp.doctorId = paciente.doctor._id;
        
      }
      pacienteTemp.fechaRegistro = paciente.fechaRegistro;
      pacienteTemp.fechaUltimaContrasena = paciente.fechaUltimaContrasena;
    }

    
    res.status(200).json({success: true, paciente: pacienteTemp});
  } catch (error) {    
    res.status(400).json({ success: false, msg: "Paciente no encontrado" });    
  }

});

/**
 * Actualización de datos de la cuenta
 */
router.put('/', 
passport.authenticate('jwt', { session: false }),
[
  //validaciones
  body('edad').optional().isInt({ min: 18, max: 100 })
],
permisos.soloPaciente,
async (req ,res) => {
  
  const errores = validationResult(req);
  const id = req.user._id;

  if (errores.isEmpty()) {
    pacienteTemp = { };
    
    if (req.body.nombre) pacienteTemp.nombre = req.body.nombre;
    if (req.body.apellido) pacienteTemp.apellido = req.body.apellido;
    if (req.body.edad) pacienteTemp.edad = req.body.edad;
    if (req.body.sexo) pacienteTemp.sexo = req.body.sexo;
    if (req.body.correo) pacienteTemp.correo = req.body.correo;

    if (req.body.peso !== undefined) pacienteTemp.peso = req.body.peso;
    if (req.body.altura !== undefined) pacienteTemp.altura = req.body.altura;
    if (req.body.doctor !== undefined) pacienteTemp.doctor = req.body.doctor;
       
    
    try {
      let paciente = await Paciente.findById({ _id: id }).exec();
      let actualizacion = {};
      for (const prop in pacienteTemp) {
        if (pacienteTemp.hasOwnProperty(prop)) {
          if (paciente[prop] !== pacienteTemp[prop]) {
            if (pacienteTemp[prop] === '') { // para borrar una propiedad basta con mandar un string vacío
              await Paciente.findByIdAndUpdate({ _id: id }, { $unset: {[prop] : 1 } }).exec();
            } else {
              actualizacion[prop] = pacienteTemp[prop];
            }
          }          
        }
      }

      if (req.body.contrasena) {
        const contrasena = req.body.contrasena;
        let comparacion = await bcrypt.compare(contrasena, paciente.contrasena);
  
        if (comparacion === false) {
          let hash = await bcrypt.hash(contrasena, 10);
          actualizacion.contrasena = hash;
          actualizacion.fechaUltimaContrasena = new Date();
          
          if (actualizacion) {
            let actualizar = await Paciente.findByIdAndUpdate(id, actualizacion).exec();
            res.status(200).json({ success: true, msg: "Perfil Actualizado" });            
          }
        } else {
          if (actualizacion) {
            let actualizar = await Paciente.findByIdAndUpdate(id, actualizacion).exec();
            res.status(200).json({ success: true, msg: "Perfil Actualizado" });            
          }
        }        
      } else {
        if (actualizacion) {
          let actualizar = await Paciente.findByIdAndUpdate(id, actualizacion).exec();
          res.status(200).json({ success: true, msg: "Perfil Actualizado" });          
        }
      }
    } catch (error) {
      res.status(400).json({ success: false, msg: "Fallo al actualizar datos de paciente" });
    }

    // En caso de no cumplir las validaciones
  } else {
    res.status(400).json({ success: false, msg: "Las actualizaciones no cumplen con el esquema" });
  }  
});


/**
 * Borrar Paciente
 */
router.delete('/', passport.authenticate('jwt', { session: false }), permisos.soloPaciente, async (req, res) => {
  const id = req.user._id;
  try {
    let borrar = await Paciente.findByIdAndRemove(id).exec();
    res.status(200).json({ success: true, msg: "Paciente eliminado" });  
  } catch (error) {
    res.status(400).json({ success: false, msg: "Error al intentar eliminar paciente" });
  }
});


module.exports = router;