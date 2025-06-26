import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initDatabase } from './database/init.js';
import pupilsRouter from './routes/pupils.js';
import absencesRouter from './routes/absences.js';
import alertsRouter from './routes/alerts.js';
import importRouter from './routes/import.js';
import exportRouter from './routes/export.js';
import emailRouter from './routes/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
initDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/pupils', pupilsRouter);
app.use('/api/absences', absencesRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/import', importRouter);
app.use('/api/export', exportRouter);
app.use('/api/email', emailRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});