import express from 'express';
import db from '../database/init.js';

const router = express.Router();

// Get alerts for a pupil
router.get('/pupil/:pupilId', (req, res) => {
  try {
    const alerts = db.prepare(`
      SELECT * FROM alerts 
      WHERE pupil_id = ? 
      ORDER BY alert_date DESC
    `).all(req.params.pupilId);
    
    res.json(alerts);
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create alert
router.post('/', (req, res) => {
  try {
    const { pupil_id, alert_date, note } = req.body;
    const stmt = db.prepare('INSERT INTO alerts (pupil_id, alert_date, note) VALUES (?, ?, ?)');
    const result = stmt.run(pupil_id, alert_date, note);
    
    const newAlert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newAlert);
  } catch (error) {
    console.error('Erreur lors de la création de l\'alerte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;