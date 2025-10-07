const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

dotenv.config();

const app = express();

// --- Middlewares globaux ---
app.use(helmet()); // Sécurité des headers HTTP
app.use(cors({ origin: '*' })); // Autoriser toutes les origines (tu peux restreindre plus tard)
app.use(morgan('dev')); // Logger des requêtes HTTP
app.use(express.json()); // Parser JSON
app.use(express.urlencoded({ extended: true })); // Parser données form

// --- Config Nodemailer ---
// const adminMail = process.env.NODEMAILER_AUTH_MAIL;
// const adminMailPass = process.env.NODEMAILER_AUTH_PASS;





// --- Route pour envoyer un email ---
app.post('/send-email', async (req, res) => {
  const { to, subject, text, from, adminMail, adminMailPass, serviceSMTP } = req.body;

  if (!adminMail || !adminMailPass) {
  console.error("❌ Erreur : variables d'environnement manquantes (NODEMAILER_AUTH_MAIL / NODEMAILER_AUTH_PASS)");
  process.exit(1);
}

  const transporter = nodemailer.createTransport({
  service: serviceSMTP || 'gmail',
  auth: {
    user: adminMail,
    pass: adminMailPass,
  },
});

  if (!to || !subject || !text || !from) {
    return res.status(400).json({ success: false, error: 'Champs requis manquants' });
  }

  try {
    const info = await transporter.sendMail({ from, to, subject, text });
    res.json({ success: true, message: 'Email envoyé ✅', info });
  } catch (error) {
    console.error('Erreur envoi email:', error);
    res.status(500).json({ success: false, error: 'Erreur envoi email' });
  }
});

// --- Lancement du serveur ---
const PORT = process.env.PORT || 3052;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
