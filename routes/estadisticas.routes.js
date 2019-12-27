const express = require('express');
const router = express.Router();
const Medicion = require('../models/medicion.model');
const passport = require('passport');
const permisos = require('../config/permisos.config');
const mongoose = require('mongoose');

const config = require('../config/database.config');


/**
 * Valores Max Min y Promedio de Presión Sistólica por fechas
 */
router.get('/resumen/:variable/:id', passport.authenticate('jwt', { session: false }), permisos.pacienteDoctor, async (req, res) => {
  //desde y hasta debe estar en un valor epoch en milisegundos
  let desde = req.query.desde;
  let hasta = req.query.hasta;
  let variable = req.params.variable;
  let id = req.params.id;
 
  
  switch (variable) {
    case "sistolica":
      var parametro = "presionSistolica";
      break;
    case "diastolica":
      var parametro = "presionDiastolica";
      break;
    case "pulso":
      var parametro = "pulso";
      break;
    default:
      return res.status(400).json({ success: false, msg: "Error al realizar operación" });
      break;
  }  

  try {
    let analisis = await Medicion.obtenerResumen(id, parametro, desde, hasta);
    res.status(200).json({success: true, parametro, valores: analisis});    
  } catch (error) {
    res.status(400).json({ success: false, msg: "Error al realizar operación" });    
  }

});

/**
 * Valores promedio de todas las presiones por fecha
 */
router.get('/promedio/:id', passport.authenticate('jwt', { session: false }), permisos.pacienteDoctor, async (req, res) => {
  //desde y hasta debe estar en un valor epoch en milisegundos
  let desde = req.query.desde;
  let hasta = req.query.hasta;
  let id = req.params.id;
  let fechas = [];
  let presionSistolica = [];
  let presionDiastolica = [];    
  let pulso = []; 

  try {
    let promedios = await Medicion.obtenerPromedios(id, desde, hasta);
    
    for (const promedio of promedios) {
      fechas.push(promedio._id);
      presionSistolica.push(Number(promedio.avgSistolica.toFixed(2)));
      presionDiastolica.push(Number(promedio.avgDiastolica.toFixed(2)));
      pulso.push(Number(promedio.avgPulso.toFixed(2)));
           
    }
    res.status(200).json({ success: true, valores: {
      fechas,
      presionSistolica,
      presionDiastolica,
      pulso
    }});
    
  } catch (error) {
    res.status(400).json({ success: false, msg: "Error al realizar operación" });    
  }

});


/**
 * Porcentajes de presión y pulso, en grados normal, bajo y alto
 */
router.get('/porcentajes/:variable/:id', passport.authenticate('jwt', { session: false }), permisos.pacienteDoctor, async (req, res) => {
  let idPaciente = mongoose.Types.ObjectId(req.params.id);
  let variable = req.params.variable;

  if (!['sistolica', 'diastolica', 'pulso'].includes(variable)) {
    return res.status(400).json({ success: false, msg: "Error al realizar operación" });
  }

  try {
    let totalAltos = 0;
    let totalNormales = 0;
    let totalBajos = 0;    
    let totales = await Medicion.obtenerPorcentajes(idPaciente, variable);
    for (const total of totales) {
      if (total._id.alto === false && total._id.bajo === true) {
        totalBajos = total.numMediciones;
      }
      if (total._id.alto === true && total._id.bajo === false) {
        totalAltos = total.numMediciones;
      }
      if (total._id.alto === false && total._id.bajo === false) {
        totalNormales = total.numMediciones;
      }
    }

    let total = totalAltos + totalNormales + totalBajos;
    let porcentajeAltos = (totalAltos * 100)/ total;
    let porcentajeBajos = (totalBajos * 100) / total;
    let porcentajeNormales = (totalNormales * 100) / total;

    let porcentajes = [
      Number(porcentajeAltos.toFixed(2)),
      Number(porcentajeNormales.toFixed(2)),
      Number(porcentajeBajos.toFixed(2))
    ];
    
    res.status(200).json({ success: true,  porcentajes});
  } catch (error) {    
    console.log(error);
    
    res.status(400).json({ success: false, msg: "Error al realizar operación" });
  }

});

/**
 * Porcentajes de presión y pulso normal, bajo y alto, dependiendo la hora del día
 */
router.get('/porcentajes/hora/:variable/:id', passport.authenticate('jwt', { session: false }), permisos.pacienteDoctor, async (req, res) => {
  let idPaciente = mongoose.Types.ObjectId(req.params.id);
  let variable = req.params.variable;

  if (!['sistolica', 'diastolica', 'pulso'].includes(variable)) {
    return res.status(400).json({ success: false, msg: "Error al realizar operación" });
  }

  try {

    let dia = {
      totalBajos: 0,
      totalNormales: 0,
      totalAltos: 0      
    };

    let tarde = {
      totalBajos: 0,
      totalNormales: 0,
      totalAltos: 0
    };

    let noche = {
      totalBajos: 0,
      totalNormales: 0,
      totalAltos: 0
    };

    let totales = await Medicion.obtenerPorcentajesHora(idPaciente, variable);  
    
    for (const total of totales) {
      if (total._id.horaDia === 'dia') {
        if (total._id.alto === false && total._id.bajo === true) {
          dia.totalBajos = total.numMediciones;
        }
        if (total._id.alto === true && total._id.bajo === false) {
          dia.totalAltos = total.numMediciones;
        }
        if (total._id.alto === false && total._id.bajo === false) {
          dia.totalNormales = total.numMediciones;
        }        
      }
      if (total._id.horaDia === 'tarde') {
        if (total._id.alto === false && total._id.bajo === true) {
          tarde.totalBajos = total.numMediciones;
        }
        if (total._id.alto === true && total._id.bajo === false) {
          tarde.totalAltos = total.numMediciones;
        }
        if (total._id.alto === false && total._id.bajo === false) {
          tarde.totalNormales = total.numMediciones;
        }
      }
      if (total._id.horaDia === 'noche') {
        if (total._id.alto === false && total._id.bajo === true) {
          noche.totalBajos = total.numMediciones;
        }
        if (total._id.alto === true && total._id.bajo === false) {
          noche.totalAltos = total.numMediciones;
        }
        if (total._id.alto === false && total._id.bajo === false) {
          noche.totalNormales = total.numMediciones;
        }
      }
    }

    let totalDia = dia.totalBajos + dia.totalAltos + dia.totalNormales;
    let totalTarde = tarde.totalBajos + tarde.totalAltos + tarde.totalNormales;
    let totalNoche = noche.totalBajos + noche.totalAltos + noche.totalNormales;

    
    let porcentDia = {
      altos: Number(((dia.totalAltos * 100) / totalDia).toFixed(2)),
      bajos: Number(((dia.totalBajos * 100) / totalDia).toFixed(2)),
      normales: Number(((dia.totalNormales * 100) / totalDia).toFixed(2))      
    };

    let porcentTarde = {
      altos: Number(((tarde.totalAltos * 100) / totalTarde).toFixed(2)),
      bajos: Number(((tarde.totalBajos * 100) / totalTarde).toFixed(2)),
      normales: Number(((tarde.totalNormales * 100) / totalTarde).toFixed(2))
    };

    let porcentNoche = {
      altos: Number(((noche.totalAltos * 100) / totalNoche).toFixed(2)),
      bajos: Number(((noche.totalBajos * 100) / totalNoche).toFixed(2)),
      normales: Number(((noche.totalNormales * 100) / totalNoche).toFixed(2))
    };
  
    let porcentajesDia = [porcentDia.altos, porcentDia.normales, porcentDia.bajos];
    let porcentajesTarde = [porcentTarde.altos, porcentTarde.normales, porcentTarde.bajos];
    let porcentajesNoche = [porcentNoche.altos, porcentNoche.normales, porcentNoche.bajos];
    

    res.status(200).json({ success: true, porcentajesDia, porcentajesTarde, porcentajesNoche });
  } catch (error) {
    res.status(400).json({ success: false, msg: "Error al realizar operación" });
  }

});

/*Experimental*/
router.put('/exportar', passport.authenticate('jwt', { session: false }), permisos.pacienteDoctor, (req, res) => {
  const correo = req.user.correo;

  config.transport.sendMail({
    to: correo,
    subject: `Resumen de Estadísticas`,
    html: `<p>Estimado usuario,</p>
           <p>Su resumen de estadísticas fue exportado exitosamente y fue adjuntado a este correo de donde lo puede descargar.</p>`,
    attachments: {
      filename: 'resumen.pdf',
      content: req
    }
  });
  res.status(200).json({success: true});
});

module.exports = router;