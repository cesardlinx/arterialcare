const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Valor = require('./valor.schema');
const Paciente = require('./paciente.model');

/**
 * Esquema
 */

const medicionSchema = new Schema({
  paciente: {
    type: Schema.Types.ObjectId,
    ref: "pacientes",
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  horaDia: {
    type: String,
    required: true
  },
  valores: [Valor]
});

//===========================================================================================

/**
 * Ingreso de mediciones
 */
medicionSchema.statics.ingresarMedicion = async function (id, presionSistolica, presionDiastolica, pulso, fechaCompleta) {

  /*Comprobación de validez de la fecha*/
  if (Date.parse(fechaCompleta)) {
    var date = time = new Date(fechaCompleta);
    var hora = date.getHours();
    var fecha = date.setHours(0, 0, 0, 0);
    var horaDia = obtenerHoraDia(hora);

    

  } else {
    throw new Error('Fecha no válida');
  }

  // Manejo sincrónico de promesas
  let medicion = await this.findOne({ paciente: id, fecha: new Date(fecha), horaDia: horaDia }).exec();

  if (medicion) {
    //actualizacion de la medida
    let actualizacion = await this.findByIdAndUpdate(
      medicion._id,
      {
        "$push": {
          "valores": {
            hora: new Date(fechaCompleta),
            presionSistolica: presionSistolica,
            presionDiastolica: presionDiastolica,
            pulso: pulso
          }
        }
      },
      { upsert: true, runValidators: true }
    ).exec();

    return actualizacion; //promesa

  } else {
    // creación de nueva medida
    let medicionTemp = {
      paciente: id,
      fecha: fecha,
      horaDia: horaDia,
      valores: {
        hora: new Date(fechaCompleta),
        presionSistolica: presionSistolica,
        presionDiastolica: presionDiastolica,
        pulso: pulso,
      }
    };

    const nuevaMedicion = new Medicion(medicionTemp);
    return nuevaMedicion.save(); //promesa
  }
};


/**
 * Obtener hora del día (Función Auxiliar)
 */

function obtenerHoraDia(hora) {
  let horaDia;
  if (hora >= 6 && hora < 12) {
    horaDia = "dia";
  } else if (hora >= 12 && hora < 18) {
    horaDia = "tarde";
  } else {
    horaDia = "noche";
  }
  return horaDia;
}

//===========================================================================================

/**
 * Obtener historial de mediciones
 */
medicionSchema.statics.obtenerHistorial = function (id, pagina) {
  let idPaciente = mongoose.Types.ObjectId(id);
  return this.aggregate([
    { $match: { paciente: idPaciente } },
    { $unwind: `$valores` },
    {
      $project: {
        _id: 0,
        id: '$valores._id',
        hora: '$valores.hora',
        presionSistolica: '$valores.presionSistolica',
        presionDiastolica: '$valores.presionDiastolica',
        pulso: '$valores.pulso'
      }
    },
    { $sort: { 'hora' : -1}},
    { $skip: pagina*10 },
    { $limit: 10 }
  ]).exec();
}

/**
 * Contar número de mediciones en total
 */
medicionSchema.statics.totalMediciones = function (id) {
  let idPaciente = mongoose.Types.ObjectId(id);
  return this.aggregate([
    { $match: { paciente: idPaciente } },
    { $unwind: `$valores` },
    {
      $group: {
        _id: 'paciente',
        total: { $sum: 1 }
      }
    }
  ]).exec();
}

/**
 * Obtener mediciones por fecha
 */
medicionSchema.statics.obtenerHistorialFecha = function (id, fecha) {
  let idPaciente = mongoose.Types.ObjectId(id);
  
  return this.aggregate([
    { $match: { paciente: idPaciente, fecha: new Date(fecha) } },
    { $unwind: `$valores` },
    {
      $project: {
        _id: 0,
        id: '$valores._id',
        hora: '$valores.hora',
        presionSistolica: '$valores.presionSistolica',
        presionDiastolica: '$valores.presionDiastolica',
        pulso: '$valores.pulso'
      }
    },
    { $sort: { hora: -1 } }
  ]).exec();
}

/**
 * Obtener Valores Max Min y Promedio por fechas
 */
medicionSchema.statics.obtenerResumen = function (id, parametro, desde, hasta) {

  let idPaciente = mongoose.Types.ObjectId(id);  
  return this.aggregate([
    { $unwind: `$valores` },
    { $match: { paciente: idPaciente, fecha: { $gte: new Date(desde), $lte: new Date(hasta) } } },
    {
      $group: {
        "_id": "$horaDia",
        total: { $sum: 1 },
        avg: { $avg: `$valores.${parametro}` },
        max: { $max: `$valores.${parametro}` },
        min: { $min: `$valores.${parametro}` }
      }
    },
    { $sort: { '_id': 1 } },
  ]).exec();
}

//===========================================================================================


/**
 * Obtener Valores Promedio
 */
/*desde y hasta son variables de tipo Date*/
 medicionSchema.statics.obtenerPromedios = function (id, desde, hasta) {
  let idPaciente = mongoose.Types.ObjectId(id);   
  return this.aggregate([
    { $unwind: "$valores" },
    { $match: { paciente: idPaciente, fecha: { $gte: new Date(desde), $lte: new Date(hasta) } } },
    {
      $group: {
        "_id": "$fecha",
        avgSistolica: { $avg: "$valores.presionSistolica" },
        avgDiastolica: { $avg: "$valores.presionDiastolica" },
        avgPulso: { $avg: "$valores.pulso" }
      }
    },
    { $sort: { '_id': 1 } },    
  ]).exec();
  
 }

//===========================================================================================


/**
 * Query que sirvirá para obtener los porcentajes de 'normal', 'alto', 'bajo', dependiendo
 * de la variable medida.
 */
medicionSchema.statics.obtenerPorcentajes = function (id, variable) {
 
  switch (variable) {
    case "sistolica":
      var parametro = "presionSistolica";
      var limiteAlto = 120;
      var limiteBajo = 90;
      break;
    case "diastolica":
      var parametro = "presionDiastolica";
      var limiteAlto = 80;
      var limiteBajo = 60;
      break;
    case "pulso":
      var parametro = "pulso";
      var limiteAlto = 100;
      var limiteBajo = 60;
      break;
  }

  return this.aggregate([
    { $match: { paciente: id } },
    {
      $project: {
        [parametro]: `$valores.${parametro}`,
      }
    },
    { $unwind: `$${parametro}` },
    {
      $project: {
        alto: { $gt: [`$${parametro}`, limiteAlto] },
        bajo: { $lt: [`$${parametro}`, limiteBajo] }
      }
    },
    {
      $group: {
        "_id": {
          "alto": "$alto",
          "bajo": "$bajo",
        },
        "numMediciones": { "$sum": 1 },
      }
    },
  ]).exec();
};

/**
 * Query que sirvirá para obtener los porcentajes de 'normal', 'alto', 'bajo', dependiendo
 * de la variable medida y la hora del dia
 */
medicionSchema.statics.obtenerPorcentajesHora = function (id, variable) {

  switch (variable) {
    case "sistolica":
      var parametro = "presionSistolica";
      var limiteAlto = 120;
      var limiteBajo = 90;
      break;
    case "diastolica":
      var parametro = "presionDiastolica";
      var limiteAlto = 80;
      var limiteBajo = 60;
      break;
    case "pulso":
      var parametro = "pulso";
      var limiteAlto = 100;
      var limiteBajo = 60;
      break;
  }

  return this.aggregate([
    { $match: { paciente: id } },
    {
      $project: {
        [parametro]: `$valores.${parametro}`,
        horaDia: "$horaDia"
      }
    },
    { $unwind: `$${parametro}` },
    {
      $project: {
        horaDia: "$horaDia",
        alto: { $gt: [`$${parametro}`, limiteAlto] },
        bajo: { $lt: [`$${parametro}`, limiteBajo] }
      }
    },
    {
      $group: {
        "_id": {
          "alto": "$alto",
          "bajo": "$bajo",
          "horaDia": "$horaDia"
        },
        "numMediciones": { "$sum": 1 },
      }
    },
  ]).exec();
};

//===========================================================================================

/**
 * Comprueba si un documento tiene documentos hijos con valores
 */
medicionSchema.statics.existenDocumentosHijos = function (id) {
  // la id ya tiene que venir como object Id
  // el id es del la medicion es decir del subdocumento
  return this.aggregate([
    { $match: { "valores._id": id } },
    { $unwind: "$valores" },
    {
      $group: {
        _id: "$_id",
        total: { $sum: 1 }
      }
    },
    {
      $project: { _id: 0 }
    }
  ]).exec();

}

const Medicion = mongoose.model('mediciones', medicionSchema);
module.exports = Medicion;