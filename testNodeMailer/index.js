const nodemailer = require('nodemailer');

// Création du transporteur
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou 'hotmail', 'yahoo', etc.
  auth: {
    user: 'nkenlamichel@gmail.com',
    pass: 'wfyn ydqn xdni uomt',
  },
});

// Fonction pour envoyer un email
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: 'smoital@gmail.com',
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé: ', info.response);
  } catch (error) {
    console.error('Erreur envoi email: ', error);
  }
};


sendEmail('mit254@proton.me', 'helloworld', 'the helloworld')
