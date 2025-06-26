import express from 'express';
import db from '../database/init.js';

const router = express.Router();

// Get absences for a specific month
router.get('/month/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;
    
    const absences = db.prepare(`
      SELECT a.*, p.first_name, p.last_name 
      FROM absences a 
      JOIN pupils p ON a.pupil_id = p.id 
      WHERE a.date BETWEEN ? AND ?
      ORDER BY a.date, a.half_day
    `).all(startDate, endDate);
    
    res.json(absences);
  } catch (error) {
    console.error('Erreur lors de la récupération des absences:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get absences for a specific pupil
router.get('/pupil/:pupilId', (req, res) => {
  try {
    const absences = db.prepare(`
      SELECT * FROM absences 
      WHERE pupil_id = ? 
      ORDER BY date DESC, half_day
    `).all(req.params.pupilId);
    
    res.json(absences);
  } catch (error) {
    console.error('Erreur lors de la récupération des absences de l\'élève:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update or create absence
router.put('/', (req, res) => {
  try {
    const { pupil_id, date, half_day, status } = req.body;
    
    if (status === 'P') {
      // If status is Present, delete the absence record
      const stmt = db.prepare('DELETE FROM absences WHERE pupil_id = ? AND date = ? AND half_day = ?');
      stmt.run(pupil_id, date, half_day);
    } else {
      // Otherwise, insert or update the absence
      const stmt = db.prepare(`
        INSERT INTO absences (pupil_id, date, half_day, status) 
        VALUES (?, ?, ?, ?)
        ON CONFLICT(pupil_id, date, half_day) 
        DO UPDATE SET status = excluded.status
      `);
      stmt.run(pupil_id, date, half_day, status);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'absence:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get monthly stats
router.get('/stats/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;
    
    const stats = db.prepare(`
      SELECT 
        COUNT(CASE WHEN half_day = 'AM' AND status != 'P' THEN 1 END) as absences_am,
        COUNT(CASE WHEN half_day = 'PM' AND status != 'P' THEN 1 END) as absences_pm,
        COUNT(CASE WHEN half_day = 'AM' AND status = 'E' THEN 1 END) as excused_am,
        COUNT(CASE WHEN half_day = 'PM' AND status = 'E' THEN 1 END) as excused_pm,
        COUNT(CASE WHEN half_day = 'AM' AND status = 'O' THEN 1 END) as unjustified_am,
        COUNT(CASE WHEN half_day = 'PM' AND status = 'O' THEN 1 END) as unjustified_pm,
        COUNT(CASE WHEN half_day = 'AM' AND status = 'C' THEN 1 END) as medical_am,
        COUNT(CASE WHEN half_day = 'PM' AND status = 'C' THEN 1 END) as medical_pm
      FROM absences 
      WHERE date BETWEEN ? AND ?
    `).get(startDate, endDate);
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;