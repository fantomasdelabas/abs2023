import db, { initDatabase } from '../database/init.js';

// Initialize database first
initDatabase();

// Sample pupils data
const pupils = [
  { first_name: 'Emma', last_name: 'Dupont', class_group: '6A', email: 'parent1@example.com' },
  { first_name: 'Louis', last_name: 'Martin', class_group: '6A', email: 'parent2@example.com' },
  { first_name: 'Léa', last_name: 'Bernard', class_group: '6A', email: 'parent3@example.com' },
  { first_name: 'Hugo', last_name: 'Petit', class_group: '6B', email: 'parent4@example.com' },
  { first_name: 'Chloé', last_name: 'Durand', class_group: '6B', email: 'parent5@example.com' },
  { first_name: 'Nathan', last_name: 'Moreau', class_group: '6B', email: 'parent6@example.com' },
  { first_name: 'Manon', last_name: 'Simon', class_group: '5A', email: 'parent7@example.com' },
  { first_name: 'Théo', last_name: 'Michel', class_group: '5A', email: 'parent8@example.com' },
  { first_name: 'Sarah', last_name: 'Laurent', class_group: '5A', email: 'parent9@example.com' },
  { first_name: 'Alexandre', last_name: 'Lefebvre', class_group: '5B', email: 'parent10@example.com' }
];

// Insert pupils
const insertPupil = db.prepare('INSERT INTO pupils (first_name, last_name, class_group, email) VALUES (?, ?, ?, ?)');

console.log('Insertion des élèves...');
pupils.forEach(pupil => {
  insertPupil.run(pupil.first_name, pupil.last_name, pupil.class_group, pupil.email);
});

// Insert some sample absences for current month
const insertAbsence = db.prepare('INSERT INTO absences (pupil_id, date, half_day, status) VALUES (?, ?, ?, ?)');

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

console.log('Insertion d\'absences d\'exemple...');

// Add some random absences for demonstration
const sampleAbsences = [
  { pupil_id: 1, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`, half_day: 'AM', status: 'E' },
  { pupil_id: 1, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`, half_day: 'PM', status: 'E' },
  { pupil_id: 2, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-12`, half_day: 'AM', status: 'O' },
  { pupil_id: 3, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`, half_day: 'PM', status: 'C' },
  { pupil_id: 4, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-20`, half_day: 'AM', status: 'E' },
];

sampleAbsences.forEach(absence => {
  insertAbsence.run(absence.pupil_id, absence.date, absence.half_day, absence.status);
});

console.log('Base de données initialisée avec succès!');
console.log(`${pupils.length} élèves ajoutés`);
console.log(`${sampleAbsences.length} absences d'exemple ajoutées`);

process.exit(0);