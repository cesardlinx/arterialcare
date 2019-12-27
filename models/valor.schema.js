const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const valorSchema = new Schema({
  hora: {
    type: Date,
    required: true
  },
  presionSistolica: {
    type: Number,
    required: true,
    min: 10,
    max: 200
  },
  presionDiastolica: {
    type: Number,
    required: true,
    min: 10,
    max: 200
  },
  pulso: {
    type: Number,
    required: true,
    min: 10,
    max: 200
  },
});

module.exports = valorSchema;