import express from 'express';
const app = express();


// EJS als View-Engine
app.set('view engine', 'ejs');
app.set('views', './views');

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
    res.send('Dies ist die About-Seite.');
});

// Server starten
app.listen(3000, () => {
    console.log('Server läuft auf http://fi38.mshome.net:3000');
});