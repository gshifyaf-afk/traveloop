require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const db = require('./db');
const { requireLogin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }),
  secret: process.env.SESSION_SECRET || 'traveloop_premium_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/stops', require('./routes/stops'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/checklist', require('./routes/checklist'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/user', require('./routes/user'));
app.use('/shared', require('./routes/shared'));
app.use('/api', require('./routes/shared')); // For copy-trip API

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(status).json({ error: err.message || 'Something went wrong!' });
  }
  res.status(status).render('login', { error: 'An unexpected error occurred. Please try again.' });
});

// Page Routes
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { error: null });
});

app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { error: null });
});

app.get('/signup', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('signup', { error: null });
});

app.get('/dashboard', requireLogin, (req, res) => {
  const user = { name: req.session.userName };
  const tripsCount = db.prepare('SELECT COUNT(*) as count FROM trips WHERE user_id = ?').get(req.session.userId).count;
  const totalBudget = db.prepare(`
    SELECT SUM(activities.cost) as total FROM activities 
    JOIN stops ON activities.stop_id = stops.id 
    JOIN trips ON stops.trip_id = trips.id 
    WHERE trips.user_id = ?
  `).get(req.session.userId).total || 0;

  res.render('dashboard', { user, tripsCount, totalBudget });
});

app.get('/my-trips', requireLogin, (req, res) => {
  const trips = db.prepare('SELECT * FROM trips WHERE user_id = ?').all(req.session.userId);
  res.render('my_trips', { user: { name: req.session.userName }, trips });
});

app.get('/trips/create', requireLogin, (req, res) => {
  res.render('create_trip', { user: { name: req.session.userName } });
});

app.get('/trips/edit/:id', requireLogin, (req, res) => {
  const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!trip) return res.redirect('/my-trips');
  res.render('edit_trip', { user: { name: req.session.userName }, trip });
});

app.get('/trips/itinerary/:id', requireLogin, (req, res) => {
  const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!trip) return res.redirect('/my-trips');
  res.render('itinerary_builder', { user: { name: req.session.userName }, trip });
});

app.get('/trips/view/:id', requireLogin, (req, res) => {
  const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!trip) return res.redirect('/my-trips');
  res.render('itinerary_view', { user: { name: req.session.userName }, trip });
});

app.get('/profile', requireLogin, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  res.render('profile', { user });
});

// API Docs
app.get('/api/docs', (req, res) => {
  res.send(`
    <h1>Traveloop API Documentation</h1>
    <ul>
      <li>POST /api/auth/signup</li>
      <li>POST /api/auth/login</li>
      <li>POST /api/auth/logout</li>
      <li>GET /api/trips</li>
      <li>POST /api/trips</li>
      <li>PUT /api/trips/:id</li>
      <li>DELETE /api/trips/:id</li>
      <li>GET /api/stops?trip_id=:id</li>
      <li>POST /api/stops</li>
      <li>PUT /api/stops/:id</li>
      <li>DELETE /api/stops/:id</li>
      <li>GET /api/activities?stop_id=:id</li>
      <li>POST /api/activities</li>
      <li>PUT /api/activities/:id</li>
      <li>DELETE /api/activities/:id</li>
      <li>GET /api/budget/:tripId</li>
      <li>GET /api/checklist/:tripId</li>
      <li>POST /api/checklist</li>
      <li>PUT /api/checklist/:id</li>
      <li>DELETE /api/checklist/:id</li>
      <li>GET /api/notes/:tripId</li>
      <li>POST /api/notes</li>
      <li>DELETE /api/notes/:id</li>
      <li>POST /api/copy-trip</li>
    </ul>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
