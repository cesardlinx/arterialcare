const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const Paciente = require('../models/paciente.model');
const Doctor = require('../models/doctor.model');
const config = require('../config/database.config');

module.exports = function (passport) {
  let opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secret
  };

  passport.use(new JwtStrategy(opts, async (payload, done) => {

  
    // Comprobación de la fecha de expiracion
    const hoy = new Date();
    const expira = new Date(parseInt(payload.exp));
    if (expira < hoy) {
      return done(null, false);
    }

    
    try {      
      if (payload.role === 'paciente') {
        let user = await Paciente.findOne({ _id: payload.sub }).exec();
        if (user) {
          user._type = "paciente";
          return done(null, user);
        } else {
          return done(null, false);          
        }      
      } else if (payload.role === 'doctor') {
        let user = await Doctor.findOne({ _id: payload.sub }).exec();
        if (user) {
          user._type = "doctor";
          return done(null, user);          
        } else {
          return done(null, false);          
        }
      }
    } catch (error) {
      return done(err, false);      
    }
    
  }));
}
