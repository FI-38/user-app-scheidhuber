import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// EJS als View-Engine
app.set('view engine', 'pug');
app.set('views', './views');

// Bootstrap CSS und JS bereitstellen
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

// Statische Dateien aus 'public'-Verzeichnis
app.use(express.static('public'));

// Startseite mit EJS Template
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Startseite',
    message: 'Willkommen!',
    user: { name: 'Max' }
  });
});

// Weitere Route
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'Über uns',
        content: 'Dies ist die About-Seite.',
        user: { name: 'Max' }
    });
});

// contact route
app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Kontakt',
        user: { name: 'Max' }
    });
});

// Server starten
app.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});