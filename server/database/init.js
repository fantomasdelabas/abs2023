import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '../../data/absences.db');

// Créer le dossier si nécessaire
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

// Connexion à la base de données
const db = new Database(dbPath);

// Initialisation de la base de données
export const initDatabase = () => {
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS pupils (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      class_group TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS absences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pupil_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      half_day TEXT NOT NULL CHECK (half_day IN ('AM', 'PM')),
      status TEXT NOT NULL DEFAULT 'P' CHECK (status IN ('P', 'E', 'O', 'C')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pupil_id) REFERENCES pupils (id) ON DELETE CASCADE,
      UNIQUE(pupil_id, date, half_day)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pupil_id INTEGER NOT NULL,
      alert_date TEXT NOT NULL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pupil_id) REFERENCES pupils (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS holidays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const defaultSettings = [
    ['email_smtp_host', 'smtp.outlook.com'],
    ['email_smtp_port', '587'],
    ['email_template_absence', 'Bonjour,\n\nNous avons constaté que {pupil_name} était absent(e) le {date}.\n\nCordialement,\nL\'équipe pédagogique'],
    ['school_name', 'École Primaire'],
    ['color_scheme', 'blue']
  ];

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  for (const [key, value] of defaultSettings) {
    insertSetting.run(key, value);
  }

  console.log('Base de données initialisée avec succès');
};

// Fonctions pratiques
export const run = (sql, params = []) => {
  return db.prepare(sql).run(params);
};

export const get = (sql, params = []) => {
  return db.prepare(sql).get(params);
};

export const all = (sql, params = []) => {
  return db.prepare(sql).all(params);
};

// ⬅️ Voilà ce qu’il fallait pour pupils.js !
export default db;
