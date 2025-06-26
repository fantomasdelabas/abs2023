import express from 'express';
import db from '../database/init.js';
import { generatePDF } from '../services/pdfGenerator.js';

const router = express.Router();

// Export CSV
router.get('/csv/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;
    
    const pupils = db.prepare('SELECT * FROM pupils ORDER BY class_group, last_name, first_name').all();
    const absences = db.prepare(`
      SELECT * FROM absences 
      WHERE date BETWEEN ? AND ?
    `).all(startDate, endDate);
    
    // Build CSV content
    let csv = 'Élève,Classe,Date,Demi-journée,Statut\n';
    
    pupils.forEach(pupil => {
      const pupilAbsences = absences.filter(a => a.pupil_id === pupil.id);
      if (pupilAbsences.length === 0) {
        csv += `"${pupil.first_name} ${pupil.last_name}","${pupil.class_group}","","",""\n`;
      } else {
        pupilAbsences.forEach(absence => {
          const statusText = {
            'P': 'Présent',
            'E': 'Excusé',
            'O': 'Injustifié',
            'C': 'Certificat médical'
          }[absence.status];
          
          csv += `"${pupil.first_name} ${pupil.last_name}","${pupil.class_group}","${absence.date}","${absence.half_day}","${statusText}"\n`;
        });
      }
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=absences-${year}-${month}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export' });
  }
});

// Export PDF
router.get('/pdf/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const pdfBuffer = await generatePDF(year, month);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=feuille-presence-${year}-${month}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export PDF' });
  }
});

export default router;