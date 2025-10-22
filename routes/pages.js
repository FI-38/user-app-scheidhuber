import express from 'express';

const router = express.Router();


// Startseite mit EJS Template
router.get('/', (req, res) => {
  console.log(req.message);
  res.render('index', {
    title: 'Startseite',
    message: 'Willkommen!',
    user: { name: 'Max' }
  });
});

// Weitere Route
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'Über uns',
        content: 'Dies ist die About-Seite.',
        user: { name: 'Max' }
    });
});

// contact route
router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Kontakt',
        user: { name: 'Max' }
    });
});

router.post('/contact', (req, res) => {
    // email senden
    req.flash('error_msg', 'Senden noch nicht implementiert.');
    res.redirect('/contact');
});

export default router;
