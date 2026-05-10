const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

// Public shared view
router.get('/:token', (req, res) => {
  const trip = db.prepare('SELECT * FROM trips WHERE public_token = ?').get(req.params.token);
  if (!trip) return res.status(404).send('Trip not found');

  const stops = db.prepare('SELECT * FROM stops WHERE trip_id = ? ORDER BY stop_order ASC').all(trip.id);
  for (let stop of stops) {
    stop.activities = db.prepare('SELECT * FROM activities WHERE stop_id = ?').all(stop.id);
  }

  res.render('shared_view', { trip, stops, user: req.session.userId ? { name: req.session.userName } : null });
});

// Copy trip to user's account
router.post('/copy-trip', requireLogin, (req, res) => {
  const { token } = req.body;
  const originalTrip = db.prepare('SELECT * FROM trips WHERE public_token = ?').get(token);
  if (!originalTrip) return res.status(404).json({ error: 'Original trip not found' });

  const { v4: uuidv4 } = require('uuid');
  const newToken = uuidv4();

  const insertTrip = db.prepare('INSERT INTO trips (name, start_date, end_date, description, user_id, public_token) VALUES (?, ?, ?, ?, ?, ?)');
  const info = insertTrip.run(`Copy of ${originalTrip.name}`, originalTrip.start_date, originalTrip.end_date, originalTrip.description, req.session.userId, newToken);
  const newTripId = info.lastInsertRowid;

  const originalStops = db.prepare('SELECT * FROM stops WHERE trip_id = ?').all(originalTrip.id);
  for (let stop of originalStops) {
    const insertStop = db.prepare('INSERT INTO stops (city_name, city_country, arrival_date, departure_date, stop_order, trip_id) VALUES (?, ?, ?, ?, ?, ?)');
    const stopInfo = insertStop.run(stop.city_name, stop.city_country, stop.arrival_date, stop.departure_date, stop.stop_order, newTripId);
    const newStopId = stopInfo.lastInsertRowid;

    const activities = db.prepare('SELECT * FROM activities WHERE stop_id = ?').all(stop.id);
    for (let act of activities) {
      const insertAct = db.prepare('INSERT INTO activities (name, cost, activity_time, category, stop_id) VALUES (?, ?, ?, ?, ?)');
      insertAct.run(act.name, act.cost, act.activity_time, act.category, newStopId);
    }
  }

  res.json({ success: true, newTripId });
});

module.exports = router;
