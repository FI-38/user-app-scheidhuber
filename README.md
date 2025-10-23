# Express User App

Eine vollständige Express.js-Webanwendung mit Authentifizierung, MariaDB-Datenbankanbindung und Pug-Templates.

## Über das Projekt

Diese Anwendung demonstriert eine moderne Full-Stack-Webentwicklung mit:
- **Express.js** als Backend-Framework
- **Pug** als Template-Engine mit Layout-Vererbung
- **Bootstrap 5** für responsives Design
- **MariaDB** als relationale Datenbank
- **bcrypt** für sicheres Passwort-Hashing
- **JWT** für token-basierte Authentifizierung
- **Sessions & Flash Messages** für Benutzerfeedback

## Features

- ✅ Benutzerregistrierung mit Passwort-Hashing
- ✅ Login/Logout mit JWT-Token
- ✅ Geschützte und öffentliche Routen
- ✅ Middleware-basierte Authentifizierung
- ✅ Flash Messages für Erfolgsmeldungen und Fehler
- ✅ Responsive Bootstrap-Navigation mit Login-Status
- ✅ MariaDB Connection Pool
- ✅ Environment-Variablen für sichere Konfiguration

## Technologie-Stack

| Technologie | Verwendung |
|-------------|------------|
| Node.js | JavaScript-Runtime |
| Express.js | Web-Framework |
| Pug | Template-Engine |
| Bootstrap 5 | CSS-Framework |
| MariaDB | Datenbank |
| bcryptjs | Passwort-Hashing |
| jsonwebtoken | JWT-Authentifizierung |
| express-session | Session-Management |
| connect-flash | Flash Messages |
| cookie-parser | Cookie-Verwaltung |
| dotenv | Environment-Variablen |

## Voraussetzungen

- Node.js (Version 14+)
- MariaDB Server
- npm

## Installation

1. **Abhängigkeiten installieren**
   ```
   npm install
   ```

2. **Datenbank einrichten**
   ```
   mysql -u db_user -p < user.sql
   ```

3. **Environment-Variablen konfigurieren**

   Erstellen Sie eine `.env`-Datei im Projektverzeichnis:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=IhrPasswort
   DB_NAME=project_db
   JWT_SECRET=IhrGeheimesJWTSecret
   SESSION_SECRET=IhrGeheimesSessionSecret
   COOKIE_SECRET=IhrGeheimesCookieSecret
   NODE_ENV=development
   ```

4. **Server starten**
   ```
   node index.js
   ```

5. **Anwendung öffnen**
   ```
   http://localhost:3000
   ```

## Projektstruktur

```
/projekt
  /config
    database.js                 # MariaDB Connection Pool
  /middlewares
    authMiddleware.js           # JWT-Authentifizierung
  /views
    /layouts
      main.pug                  # Haupt-Layout mit Navigation
    /partials
      header.pug                # Navigation mit Login-Status
      footer.pug
    index.pug                   # Startseite
    register.pug                # Registrierungsformular
    login.pug                   # Login-Formular
    dashboard.pug               # Geschütztes Dashboard
  /public
    /css
    /js
  .env.example                          # Environment-Variablen (Bsp.)
  .gitignore
  index.js                      # Express-Server
  package.json
  user.sql                      # Datenbankstruktur
  README.md
```

## Datenbankstruktur

```
CREATE TABLE user (
  id INT(11) NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
```

## Routen

### Öffentliche Routen
- `GET /` - Startseite (mit optionaler Auth-Anzeige)
- `GET /register` - Registrierungsformular
- `POST /register` - Benutzer registrieren
- `GET /login` - Login-Formular
- `POST /login` - Benutzer anmelden

### Geschützte Routen
- `GET /dashboard` - Benutzer-Dashboard (erfordert Login)
- `POST /logout` - Benutzer abmelden

## Authentifizierung

### Registrierung
1. Benutzer gibt Username, E-Mail und Passwort ein
2. Passwort wird mit bcrypt gehasht (Salt-Rounds: 12)
3. Benutzerdaten werden in MariaDB gespeichert
4. Weiterleitung zum Login mit Success-Message

### Login
1. Benutzer gibt Username und Passwort ein
2. Passwort-Hash wird mit bcrypt verglichen
3. Bei Erfolg: JWT-Token wird erstellt und als HTTP-only Cookie gesetzt
4. Token enthält: User-ID, Username, E-Mail
5. Token-Gültigkeit: 24 Stunden

### Geschützte Routen
- Middleware prüft JWT-Token aus Cookie
- Bei ungültigem/fehlendem Token: Weiterleitung zum Login
- Bei gültigem Token: Benutzerdaten in `res.locals.user` verfügbar

## Middleware-Konzept

### authMiddleware
- Prüft JWT-Token aus Cookie
- Setzt `res.locals.user` bei gültigem Token
- Leitet zum Login um bei fehlendem/ungültigem Token

### optionalAuth
- Prüft JWT-Token, aber erzwingt keinen Login
- Ermöglicht bedingte Anzeige auf öffentlichen Seiten

### Flash Messages
- Erfolgsmeldungen: `req.flash('success_msg', 'Text')`
- Fehlermeldungen: `req.flash('error_msg', 'Text')`
- Im Template verfügbar über `res.locals`

## Sicherheit

- Passwörter werden mit bcrypt gehasht (niemals im Klartext gespeichert)
- JWT-Tokens als HTTP-only Cookies (XSS-Schutz)
- Environment-Variablen für Secrets
- SQL-Injection-Schutz durch Prepared Statements
- Session-Secret für sichere Sessions
