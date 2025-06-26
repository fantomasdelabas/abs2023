import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '../../data/absences.db');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

// Create a new database connection
const db = new sqlite3.Database(dbPath);

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        console.error('Error enabling foreign keys:', err);
        reject(err);
        return;
      }

      // Create tables
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS pupils (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            class_group TEXT NOT NULL,
            email TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('Error creating pupils table:', err);
            reject(err);
            return;
          }
        });

        db.run(`
          CREATE TABLE IF NOT EXISTS absences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pupil_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            half_day TEXT NOT NULL CHECK (half_day IN ('AM', 'PM')),
            status TEXT NOT NULL DEFAULT 'P' CHECK (status IN ('P', 'E', 'O', 'C')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pupil_id) REFERENCES pupils (id) ON DELETE CASCADE,
            UNIQUE(pupil_id, date, half_day)
          )
        `, (err) => {
          if (err) {
            console.error('Error creating absences table:', err);
            reject(err);
            return;
          }
        });

        db.run(`
          CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pupil_id INTEGER NOT NULL,
            alert_date TEXT NOT NULL,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pupil_id) REFERENCES pupils (id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('Error creating alerts table:', err);
            reject(err);
            return;
          }
        });

        db.run(`
          CREATE TABLE IF NOT EXISTS holidays (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            label TEXT NOT NULL
          )
        `, (err) => {
          if (err) {
            console.error('Error creating holidays table:', err);
            reject(err);
            return;
          }
        });

        db.run(`
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          )
        `, (err) => {
          if (err) {
            console.error('Error creating settings table:', err);
            reject(err);
            return;
          }

          // Insert default settings
          const defaultSettings = [
            ['email_smtp_host', 'smtp.outlook.com'],
            ['email_smtp_port', '587'],
            ['email_template_absence', 'Bonjour,\n\nNous avons constaté que {pupil_name} était absent(e) le {date}.\n\nCordialement,\nL\'équipe pédagogique'],
            ['school_name', 'École Primaire'],
            ['color_scheme', 'blue']
          ];

          const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
          
          let completed = 0;
          defaultSettings.forEach(([key, value]) => {
            insertSetting.run([key, value], (err) => {
              if (err) {
                console.error(`Error inserting setting ${key}:`, err);
                reject(err);
                return;
              }
              
              completed++;
              if (completed === defaultSettings.length) {
                console.log('Base de données initialisée avec succès');
                resolve();
              }
            });
          });
        });
      });
    });
  });
};

// Helper functions to wrap sqlite3 callbacks in promises
export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

export const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

export default {
  run,
  get,
  all,
  initDatabase
};