const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Medicion = require('../models/medicion.model');
const passport = require('passport');
const permisos = require('../config/permisos.config');

/**
 * Impórtación de valores
 */
router.post('/importar', passport.authenticate('jwt', { session: false }), permisos.soloPaciente, async (req, res) => {
  
  const id = req.user._id;

  if (Array.isArray(req.body)) {

    let importacionesExitosas = 0;
    let importacionesFallidas = 0;    

    try {
      let medidas = req.body;


      for (const medida of medidas) {

        let presionSistolica = medida.presionSistolica;
        let presionDiastolica = medida.presionDiastolica;
        let pulso = medida.pulso;
        let fechaCompleta = medida.fechaHora;

        let yaExiste = await Medicion.findOne({ 'valores.hora': new Date(fechaCompleta), 'paciente': id }).count();
        if (yaExiste) {
          importacionesFallidas++;
          throw new Error('Medida existente');
        } else {
          let resultado = await Medicion.ingresarMedicion(id, presionSistolica, presionDiastolica, pulso, fechaCompleta);
          importacionesExitosas++;
        }        
      }

      res.status(200).json({ success: true, msg: "Importación exitosa", importaciones: importacionesExitosas});

    } catch (error) {
      return res.status(400).json({ success: false, msg: "Importación fallida", importaciones: importacionesExitosas, importacionesFallidas });
    }


  } else { 

    try {
      let presionSistolica = req.body.presionSistolica;
      let presionDiastolica = req.body.presionDiastolica;
      let pulso = req.body.pulso;
      let fechaCompleta = req.body.fechaHora;

      let yaExiste = await Medicion.findOne({ 'valores.hora': new Date(fechaCompleta), 'paciente': id }).count();

      if (yaExiste) {
        throw new Error('Medida existente');
      } else {
        let resultado = await Medicion.ingresarMedicion(id, presionSistolica, presionDiastolica, pulso, fechaCompleta);
      }  
      
      return res.status(200).json({ success: true, msg: "Importación exitosa", importaciones: 1 });
    } catch (error) {
      return res.status(400).json({ success: false, msg: "Importación fallida", importaciones: 0, importacionesFallidas: 1 });
    }

  }

});

/**
 * Historial de mediciones
 */
router.get('/historial/:id', passport.authenticate('jwt', { session: false }), permisos.pacienteDoctor, async (req, res) => {
  const id = req.params.id;
  const pagina = req.query.pagina;  

  try {
    let historial = await Medicion.obtenerHistorial(id, pagina);
    let total = await Medicion.totalMediciones(id);
    if (historial.length > 0) {
      res.status(200).json({success: true, total: total[0].total, historial});      
    } else {
      res.status(200).json({ success: true, historial });      
    }
  } catch (error) {    
    res.status(400).json({success: false, msg: "Error al realizar operacion"});    
  }
});

/**
 * Historial de mediciones por fecha
 */
router.get('/historial/fechas/:id', passport.authenticate('jwt', { session: false }), permisos.pacienteDoctor, async (req, res) => {
  const id = req.params.id;
  const fecha = req.query.fecha;

  try {
    let historialFecha = await Medicion.obtenerHistorialFecha(id, fecha);
    res.status(200).json({ success: true, historialFecha });
  } catch (error) {
    res.status(400).json({ success: false, msg: "Error al realizar operacion" });
  }
});

/**
 * Obtener Medición
 */
router.get('/:id', passport.authenticate('jwt', { session: false }), permisos.soloPaciente, async (req, res) => {
  const id = req.params.id;

  try {
    let medicion = await Medicion.findOne({ "valores._id": id }, {'valores.$._id': 1, '_id': 0}).exec();
    res.status(200).json({ success: true, medicion });

  } catch (error) {
    res.status(400).json({ success: false, msg: "Error al realizar operacion" });
  }
});



/**
 * Editar Medicion
 */
router.put('/:id', passport.authenticate('jwt', { session: false }), permisos.soloPaciente, async (req, res) => {
  const id = req.params.id;

  try {
    let edicion = await Medicion.findOneAndUpdate({"valores._id": id}, {
      "valores.$.presionSistolica": req.body.presionSistolica,
      "valores.$.presionDiastolica": req.body.presionDiastolica,
      "valores.$.pulso": req.body.pulso
    }, { runValidators: true }).exec();
    
    res.status(200).json({ success: true, msg: "Medición actualizada" });    
    
  } catch (error) {
    res.status(400).json({ success: false, msg: "Error al realizar operacion" });     
  }
});

/**
 * Borrar medicion
 */
router.delete('/:id', passport.authenticate('jwt', { session: false }), permisos.soloPaciente, async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);


  try {
    let totalDocHijos = await Medicion.existenDocumentosHijos(id);
    totalDocHijos = totalDocHijos[0].total;
    if (totalDocHijos === 1) {
      let medicion = await Medicion.findOneAndRemove({ "valores._id": id }).exec();          
    } else {
      let edicion = await Medicion.findOneAndUpdate({ "valores._id": id }, {
        $pull: { valores: { _id: id } }
      }, { new: true }).exec();
    }
    res.status(200).json({ success: true, msg: "Medición eliminada" });

  } catch (error) {       
    res.status(400).json({ success: false, msg: "Error al realizar operacion" });
  }
});

module.exports = router;