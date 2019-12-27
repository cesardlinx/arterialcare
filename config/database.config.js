const databaseURL = process.env.DATABASE || 'mongodb://localhost:27017/arterialcare';
const secreto = process.env.SECRET || 'secret';
const recaptchaSecret = process.env.RECAP_SECRET || 'secret';

const nodemailer = require('nodemailer');
const emailSecret = process.env.EMAIL_SECRET || 'secret';

module.exports = {
  database: databaseURL,
  secret: secreto,
  recaptchaSecret,
  emailSecret,
  transport: nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER || 'arterialcare.company',
      pass: process.env.GMAIL_PASS || 'password'
    }
  })

};

