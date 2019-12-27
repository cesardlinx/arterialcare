const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctorSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 40,
    validate: function (v) {
      return /^[a-zA-ZñÑ]{3,40}$/.test(v);
    }

  },
  apellido: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 40,
    validate: function (v) {
      return /^[a-zA-ZñÑ]{3,40}$/.test(v);
    }
  },
  edad: {
    type: Number,
    required: true,
    min: 18,
    max: 100,
    validate: function (v) {
      return /^[0-9]+$/.test(v);
    }
  },
  sexo: {
    type: String,
    enum: ['Masculino', 'Femenino'],
    required: true
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    maxlength: 200,
    validate: function (v) {
      return /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/.test(v);
    }
  },
  contrasena: {
    type: String,
    required: true,
    minlength: 8
  },
  fechaRegistro: {
    type: Date,
    required: true
  },
  fechaUltimaContrasena: {
    type: Date,
    required: true
  },
  confirmado: {
    type: Boolean,
    default: false
  }
});


doctorSchema.virtual('nombreCompleto').get(function () {
  return `${this.nombre} ${this.apellido}`;
});

doctorSchema.index({ nombre: 'text', apellido: 'text' }); // permite usar el operador $text en los campos nombres y apellidos

const Doctor = mongoose.model('doctores', doctorSchema);
module.exports = Doctor;