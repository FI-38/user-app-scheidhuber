import express from 'express';
import { getAllUsers } from '../controller/user.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

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

// Route for Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard'
  });
});

export default router;