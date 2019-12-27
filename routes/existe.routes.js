const express = require('express');
const router = express.Router();
const Paciente = require('../models/paciente.model');
const Doctor = require('../models/doctor.model');
const mongoose = require('mongoose');

// Express Validator
const { body, query, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');


/**
 * Valida si existe un paciente
 */
router.get('/paciente', [query('correo').isEmail()], async (req, res) => {
  const correo = req.query.correo;
  const errores = validationResult(req);

  if (errores.isEmpty()) {
    try {
      let paciente = await Paciente.findOne({correo: correo}).exec();
      let resultado = (paciente) ? true : false;
      res.status(200).json({ success: true, existe: resultado });
    } catch (error) {
      res.status(200).json({ success: false, msg: "Error al realizar operación" });
    }
  } else {
    res.status(200).json({ success: false, msg: "Error al realizar operación" });
  }
});

/**
 * Valida si existe un doctor
 */
router.get('/doctor', async (req, res) => {
  const correo = req.query.correo;
  const id = req.query.id;
  const errores = validationResult(req);
  let existeId = (id) ? true : false;
  let existeCorreo = (correo) ? true : false;  

  try {
    if (existeCorreo && !existeId) {
      let doctor = await Doctor.findOne({ correo: correo }).exec();
      let resultado = (doctor) ? true : false;
      res.status(200).json({ success: true, existe: resultado });        
    } else if (existeId && !existeCorreo) {
      
      let doctor = await Doctor.findById(id).exec();
      let resultado = (doctor) ? true : false;
      res.status(200).json({ success: true, existe: resultado });
    } else {
      res.status(200).json({ success: false, msg: "Error al realizar operación" });        
    }
  } catch (error) {
    
    res.status(200).json({ success: false, msg: "Error al realizar operación" });
  }
  

});


module.exports = router;
