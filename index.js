import express from 'express';
const app = express();

// EJS als View-Engine
app.set('view engine', 'pug');
app.set('views', './views');

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