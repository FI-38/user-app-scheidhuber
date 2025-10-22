import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';

import userRouter from './routes/user.js';
import pagesRouter from './routes/pages.js';
import authRouter from './routes/auth.js';
import { timingMiddleware } from './middleware/test.js';

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

// Flash Messages für Templates verfügbar machen
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Eigene globale Middleware
app.use(timingMiddleware);

// Routen der App einbinden
app.use('/', userRouter);
app.use('/', pagesRouter);
app.use('/', authRouter);

// 404-Handler (am Ende aller Routen)
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Seite nicht gefunden'
  });
});

// Server starten
app.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});