const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/database.config');
const passport = require('passport');
const Doctor = require('../models/doctor.model');
const Paciente = require('../models/paciente.model');
const permisos = require('../config/permisos.config');
const axios = require('axios');
const queryString = require('query-string');


// Express Validator
const { body, query, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

/**
 * Registro de doctores
 */

router.post('/registrar', [
  body('edad').not().isEmpty().isInt({ min: 18, max: 100 })
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

        doctorTemp = {
          nombre: req.body.nombre,
          apellido: req.body.apellido,
          edad: req.body.edad,
          sexo: req.body.sexo,
          correo: req.body.correo,
          contrasena: req.body.contrasena,
          fechaRegistro: new Date(),
          fechaUltimaContrasena: new Date()
        };
      } else {
        return res.status(400).json({ success: false, msg: "Fallo al registrar doctor" });
      }
      /*Hash de contraseña y almacenamiento de usuario*/

      let hash = await bcrypt.hash(doctorTemp.contrasena, 10);
      doctorTemp.contrasena = hash;
      nuevoDoctor = new Doctor(doctorTemp);
      let doctor = await nuevoDoctor.save();

      /*Envío del correo*/
      const token = jwt.sign({
        iss: "arterial-care",
        sub: doctor._id,
        iat: new Date().getTime(),
        exp: new Date().setTime(new Date().getTime() + 24 * 3600 * 1000 * 7)
      }, config.emailSecret);

      const bienvenida = (paciente.sexo === 'Masculino') ? 'Bienvenido' : 'Bienvenida'

      config.transport.sendMail({
        to: doctor.correo,
        subject: `${bienvenida} a Arterialcare`,
        html: `<p>${bienvenida} ${doctor.nombre} a Arterialcare,</p>
        </p>Para completar el proceso de verificación de su correo haga click en el link a continuación:
        <a href="http://localhost:4200/ingreso/doctor/${token}">https://arterialcare.herokuapp.com/doctor/${token}</a></p>
        <p>Para protección de su cuenta, el anterior link solo es válido durante una semana.</p>.`
      });
      /*Hasta aqui el envío de correo */

      return res.status(200).json({ success: true, msg: "Perfil de Doctor creado" });
    } catch (error) {
      return res.status(400).json({ success: false, msg: "Fallo al registrar doctor" });
    }
  } else {
    return res.status(400).json({ success: false, msg: "No cumple con el esquema" });
  }
});

/**
 * Confirmación de correo
 */
router.get('/confirmar/:token', async (req, res) => {
  const token = req.params.token;
  try {
    const doctor = jwt.verify(token, config.emailSecret);
    await Doctor.findByIdAndUpdate({ _id: doctor.sub }, { confirmado: true }).exec();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(400).json({ success: false });
  }
});


/**
 * Autenticación de Doctores
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
      let user = await Doctor.findOne({ correo: usuario }).exec();
      if (!user) {
        res.status(404).json({ success: false, msg: "Doctor no encontrado" });
        return false;
      }
      let comparacion = await bcrypt.compare(contrasena, user.contrasena);
      if (comparacion === true) {
        const token = jwt.sign({
          iss: "arterial-care",
          sub: user._id,
          role: "doctor",
          iat: new Date().getTime(),
          exp: new Date().setTime(new Date().getTime() + 24 * 3600 * 1000)
        }, config.secret);
        res.status(200).json({ success: true, token: token });
      } else {
        res.status(404).json({ success: false, msg: "Doctor no encontrado" });
      }
    } catch (error) {
      res.status(404).json({ success: false, msg: "Doctor no encontrado" });
    }

    // En caso de no pasar las validaciones
  } else {
    res.status(404).json({ success: false, msg: "El doctor no existe" });
  }

});


/**
 * Obtener datos de doctor
 */
router.get('/', passport.authenticate('jwt', { session: false }), permisos.soloDoctor, async (req, res) => {
  const id = req.user._id;
  
  try {
    let doctor = await Doctor.findById({ _id: id }).exec();
    res.status(200).json({
      success: true, doctor: {
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        edad: doctor.edad,
        sexo: doctor.sexo,
        correo: doctor.correo,
        fechaRegistro: doctor.fechaRegistro,
        fechaUltimaContrasena: doctor.fechaUltimaContrasena
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, msg: "Doctor no encontrado" });
  }

});

/**
 * Obtener pacientes
 */
router.get('/pacientes', passport.authenticate('jwt', { session: false }), permisos.soloDoctor, async (req, res) => {
  const id = req.user._id;
  try {
    let pacientes = await Paciente.find({doctor: id}, '_id nombre apellido edad sexo peso altura correo').exec();
    res.status(200).json({success: true, pacientes});
  } catch (error) {
    res.status(400).json({ success: false, msg: "Error al tratar de obtener lista de pacientes" });    
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
  permisos.soloDoctor,
  async (req, res) => {
    const errores = validationResult(req);
    const id = req.user._id;

    if (errores.isEmpty()) {
      doctorTemp = { };

      if (req.body.nombre) doctorTemp.nombre = req.body.nombre;
      if (req.body.apellido) doctorTemp.apellido = req.body.apellido;
      if (req.body.edad) doctorTemp.edad = req.body.edad;
      if (req.body.sexo) doctorTemp.sexo = req.body.sexo;
      if (req.body.correo) doctorTemp.correo = req.body.correo;    

      try {
        let doctor = await Doctor.findById({ _id: id }).exec();
        let actualizacion = {};
        for (const prop in doctorTemp) {
          if (doctorTemp.hasOwnProperty(prop)) {
            if (doctor[prop] !== doctorTemp[prop]) {
              actualizacion[prop] = doctorTemp[prop];
            }
          }
        }

        if (req.body.contrasena) {
          const contrasena = req.body.contrasena;
          let comparacion = await bcrypt.compare(contrasena, doctor.contrasena);

          if (comparacion === false) {
            let hash = await bcrypt.hash(contrasena, 10);
            actualizacion.contrasena = hash;
            actualizacion.fechaUltimaContrasena = new Date();
            let actualizar = await Doctor.findByIdAndUpdate(id, actualizacion).exec();
            res.status(200).json({ success: true, msg: "Perfil Actualizado" });
          } else {
            let actualizar = await Doctor.findByIdAndUpdate(id, actualizacion).exec();
            res.status(200).json({ success: true, msg: "Perfil Actualizado" });
          }
        } else {
          let actualizar = await Doctor.findByIdAndUpdate(id, actualizacion).exec();
          res.status(200).json({ success: true, msg: "Perfil Actualizado" });
        }
        

      } catch (error) {
        console.log(error);
        res.status(400).json({ success: false, msg: "Fallo al actualizar datos de doctor" });
      }

      // En caso de no cumplir las validaciones
    } else {
      res.status(400).json({ success: false, msg: "Las actualizaciones no cumplen con el esquema" });
    }
  });


/**
 * Borrar Doctor
 */
router.delete('/', passport.authenticate('jwt', { session: false }), permisos.soloDoctor, async (req, res) => {
  const id = req.user._id;
  try {
    let eliminado = await Doctor.findOneAndRemove({_id: id}).exec();
    let referencias = await Paciente.update({ doctor: eliminado._id }, { $unset: { doctor: 1 } })
    res.status(200).json({ success: true, msg: "Doctor eliminado" });
  } catch (error) {
    res.status(400).json({ success: false, msg: "Error al intentar eliminar doctor" });
  }
});


/**
 * Buscar doctor por nombre
 */
router.get('/buscar', [ query('nombre').isAlpha() ],async (req, res) => {
  const nombre = req.query.nombre;
  const errores = validationResult(req);

  if (errores.isEmpty()) {
    try {
      let doctores = await Doctor.find({$or: [
        { nombre: new RegExp('.*' + nombre + '.*', "i") },
        { apellido: new RegExp('.*' + nombre + '.*', "i") }        
      ]},{nombre: 1, apellido: 1}).limit(10).exec();

      res.status(200).json({ success: true, doctores });
    } catch (error) {
      res.status(400).json({ success: false, msg: "Error al realizar operación" });    
    }
  } else {
    res.status(200).json({ success: false, msg: "Error al realizar operación" });        
  }
});

module.exports = router;

