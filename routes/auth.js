import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import pool from '../config/database.js';

const router = express.Router();

router.get('/register', (req, res) => {
    console.log("Registrierung");
    res.render('register', { title: 'Registrierung' });
});

router.post('/register', async (req, res) => {
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



router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
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

export default router;