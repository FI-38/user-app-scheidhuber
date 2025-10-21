import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import pool from './config/database.js';

import session from 'express-session';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Body-Parser für JSON und URL-encoded Daten
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie-Parser
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

// Flash Messages für Templates verfügbar machen
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// EJS als View-Engine
app.set('view engine', 'pug');
app.set('views', './views');

// Bootstrap CSS und JS bereitstellen
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

// Statische Dateien aus 'public'-Verzeichnis
app.use(express.static('public'));


function testMiddleware(req, res, next) {
    console.log(`${req.method} ${req.url}`);
    req.data = {my: 'data'};
    next();
}

const timingMiddleware = (req, res, next) => {
  const start = Date.now();

  // Wird nach der Response aufgerufen
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`Request dauerte ${duration}ms`);
  });

  next();
};

app.use(timingMiddleware);

// Startseite mit EJS Template
app.get('/', testMiddleware, (req, res) => {
  console.log(req.message);
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

app.post('/contact', (req, res) => {
    // email senden
    req.flash('error_msg', 'Senden noch nicht implementiert.');
    res.redirect('/contact');
});


// Alle Benutzer laden
async function getAllUsers() {
  const connection = await pool.getConnection();
  const rows = await connection.query('SELECT id, username, name, email, created_at FROM user');
  connection.release();
  return rows;
}

// Route für Benutzerliste
app.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.render('users', {
      users: users,
      title: 'Benutzerliste'
    });
  } catch (error) {
    console.error('Fehler beim Laden der Benutzer:', error);
    req.flash('error_msg', 'Fehler beim Laden der Benutzer');
    res.redirect('/');
  }
});


// Server starten
app.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});