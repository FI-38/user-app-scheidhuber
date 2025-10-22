import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

import pool from './config/database.js';
import bcrypt from 'bcryptjs';
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

app.get('/register', (req, res) => {
  res.render('register', { title: 'Registrierung' });
});

app.post('/register', async (req, res) => {
  const { username, name, email, password } = req.body;

  // Validierung
  if (password.length < 8) {
    req.flash('error_msg', 'Passwort muss mindestens 8 Zeichen lang sein');
    return res.redirect('/register');
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Prüfen ob Benutzer existiert
    const existing = await conn.query(
      'SELECT id FROM user WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      req.flash('error_msg', 'Benutzername oder E-Mail bereits vergeben');
      return res.redirect('/register');
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 12);

    // Benutzer speichern
    await conn.query(
      'INSERT INTO user (username, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [username, name, email, hashedPassword]
    );

    req.flash('success_msg', 'Registrierung erfolgreich! Bitte einloggen.');
    res.redirect('/');

  } catch (error) {
    console.error('Registrierungsfehler:', error);
    req.flash('error_msg', 'Ein Fehler ist aufgetreten');
    res.redirect('/register');
  } finally {
    if (conn) conn.release();
  }
});



app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();

    // Benutzer suchen
    const users = await conn.query(
      'SELECT * FROM user WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      req.flash('error_msg', 'Benutzername oder Passwort falsch');
      return res.redirect('/login');
    }

    const user = users[0];
    // Passwort prüfen
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      req.flash('error_msg', 'Benutzername oder Passwort falsch');
      return res.redirect('/login');
    }

    // JWT erstellen
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    // Token als Cookie setzen
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    req.flash('success_msg', 'Erfolgreich angemeldet!');
    res.redirect('/');

  } catch (error) {
    console.error('Login-Fehler:', error);
    req.flash('error_msg', 'Ein Fehler ist aufgetreten');
    res.redirect('/login');
  } finally {
    if (conn) conn.release();
  }
});

// Server starten
app.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});