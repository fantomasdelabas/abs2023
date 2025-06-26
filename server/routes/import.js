import express from 'express';
import XLSX from 'xlsx';
import db from '../database/init.js';

const router = express.Router();

// Import pupils from Excel
router.post('/pupils', (req, res) => {
  try {
    const { fileData } = req.body;
    
    // Parse Excel file
    const workbook = XLSX.read(fileData, { type: 'base64' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const insertPupil = db.prepare(`
      INSERT OR REPLACE INTO pupils (first_name, last_name, class_group, email)
      VALUES (?, ?, ?, ?)
    `);
    
    let imported = 0;
    let errors = [];
    
    data.forEach((row, index) => {
      try {
        const firstName = row['Prénom'] || row['Prenom'] || '';
        const lastName = row['Nom'] || '';
        const classGroup = row['Groupe Classe'] || row['Classe'] || '';
        const email = row['EMail adresse principale responsable élève'] || row['Email'] || '';
        
        if (!firstName || !lastName || !classGroup) {
          errors.push(`Ligne ${index + 2}: données manquantes`);
          return;
        }
        
        insertPupil.run(firstName, lastName, classGroup, email);
        imported++;
      } catch (error) {
        errors.push(`Ligne ${index + 2}: ${error.message}`);
      }
    });
    
    res.json({
      success: true,
      imported,
      errors
    });
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    res.status(500).json({ error: 'Erreur lors de l\'import du fichier' });
  }
});

export default router;