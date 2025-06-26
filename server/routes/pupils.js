import express from 'express';
import db from '../database/init.js';

const router = express.Router();

// Get all pupils
router.get('/', (req, res) => {
  try {
    const pupils = db.prepare('SELECT * FROM pupils ORDER BY class_group, last_name, first_name').all();
    res.json(pupils);
  } catch (error) {
    console.error('Erreur lors de la récupération des élèves:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get pupil by ID
router.get('/:id', (req, res) => {
  try {
    const pupil = db.prepare('SELECT * FROM pupils WHERE id = ?').get(req.params.id);
    if (!pupil) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }
    res.json(pupil);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'élève:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create pupil
router.post('/', (req, res) => {
  try {
    const { first_name, last_name, class_group, email } = req.body;
    const stmt = db.prepare('INSERT INTO pupils (first_name, last_name, class_group, email) VALUES (?, ?, ?, ?)');
    const result = stmt.run(first_name, last_name, class_group, email);
    
    const newPupil = db.prepare('SELECT * FROM pupils WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newPupil);
  } catch (error) {
    console.error('Erreur lors de la création de l\'élève:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update pupil
router.put('/:id', (req, res) => {
  try {
    const { first_name, last_name, class_group, email } = req.body;
    const stmt = db.prepare('UPDATE pupils SET first_name = ?, last_name = ?, class_group = ?, email = ? WHERE id = ?');
    const result = stmt.run(first_name, last_name, class_group, email, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }
    
    const updatedPupil = db.prepare('SELECT * FROM pupils WHERE id = ?').get(req.params.id);
    res.json(updatedPupil);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'élève:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete pupil
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM pupils WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'élève:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;