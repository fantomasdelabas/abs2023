import express from 'express';
import nodemailer from 'nodemailer';
import db from '../database/init.js';

const router = express.Router();

// Get email settings
router.get('/settings', (req, res) => {
  try {
    const settings = db.prepare(`
      SELECT key, value FROM settings 
      WHERE key LIKE 'email_%'
    `).all();
    
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    res.json(settingsObj);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres email:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update email settings
router.put('/settings', (req, res) => {
  try {
    const settings = req.body;
    const updateSetting = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
    
    Object.entries(settings).forEach(([key, value]) => {
      updateSetting.run(value, key);
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres email:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Send email
router.post('/send', async (req, res) => {
  try {
    const { pupilId, subject, message, recipientEmail } = req.body;
    
    // Get email settings
    const settings = db.prepare(`
      SELECT key, value FROM settings 
      WHERE key LIKE 'email_%'
    `).all();
    
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: settingsObj.email_smtp_host,
      port: parseInt(settingsObj.email_smtp_port),
      secure: false,
      auth: {
        user: settingsObj.email_username,
        pass: settingsObj.email_password
      }
    });
    
    // Send email
    await transporter.sendMail({
      from: settingsObj.email_from,
      to: recipientEmail,
      subject: subject,
      text: message
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
  }
});

export default router;