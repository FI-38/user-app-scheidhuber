import express from 'express';
const app = express();

// Definieren der ersten Route
app.get('/', (req, res) => {
    console.log(req);
    res.json({"hallo": "welt"});
});

// Weitere Route
app.get('/about', (req, res) => {
    res.send('Dies ist die About-Seite.');
});

// Server starten
app.listen(3000, () => {
    console.log('Server läuft auf http://fi38.mshome.net:3000');
});