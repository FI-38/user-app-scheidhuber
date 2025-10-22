import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Alle Benutzer laden
async function getAllUsers() {
  const connection = await pool.getConnection();
  const rows = await connection.query('SELECT id, username, name, email, created_at FROM user');
  connection.release();
  return rows;
}

// Route für Benutzerliste
router.get('/users', async (req, res) => {
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

export default router;