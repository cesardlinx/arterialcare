const Paciente = require('../models/paciente.model');

module.exports = {
  soloPaciente: function (req, res, next) {
    if (req.user._type === 'paciente') {
      next();
    } else {
      res.status(401).end('No autorizado');
    }
  },
  soloDoctor: function (req, res, next) {
    if (req.user._type === 'doctor') {
      next();
    } else {
      res.status(401).end('No autorizado');
    }
  },
  pacienteDoctor: async function (req, res, next) {
    if (req.user._type === 'paciente') {
      if (req.user._id == req.params.id) {
        next();
      } else {
        res.status(401).end('No autorizado');
      }
    } else if (req.user._type === 'doctor') {
      
      try {
        let paciente = await Paciente.findById(req.params.id);        

        if (String(paciente.doctor) === String(req.user._id)) {
          
          next();
        } else {
          res.status(401).end('No autorizado');
        }
      } catch (error) {
        res.status(401).end('No autorizado');
      }
    } else {
      res.status(401).end('No autorizado');
    }
  }
};


