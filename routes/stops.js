const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const { validateStop } = require('../middleware/validation');

router.get('/', requireLogin, (req, res) => {
  const stops = db.prepare(`
    SELECT stops.* FROM stops 
    JOIN trips ON stops.trip_id = trips.id 
    WHERE trips.user_id = ? AND stops.trip_id = ?
    ORDER BY stop_order ASC
  `).all(req.session.userId, req.query.trip_id);
  res.json(stops);
});

router.post('/', requireLogin, validateStop, (req, res) => {
  const { city_name, city_country = '', arrival_date, departure_date, stop_order = 0, trip_id } = req.body;
  const stmt = db.prepare('INSERT INTO stops (city_name, city_country, arrival_date, departure_date, stop_order, trip_id) VALUES (?, ?, ?, ?, ?, ?)');
  const info = stmt.run(city_name, city_country, arrival_date, departure_date, stop_order, trip_id);
  res.json({ id: info.lastInsertRowid });
});

router.put('/:id', requireLogin, validateStop, (req, res) => {
  const { city_name, city_country, arrival_date, departure_date, stop_order } = req.body;
  const stmt = db.prepare(`
    UPDATE stops SET city_name = ?, city_country = ?, arrival_date = ?, departure_date = ?, stop_order = ? 
    WHERE id = ? AND EXISTS (SELECT 1 FROM trips WHERE trips.id = stops.trip_id AND trips.user_id = ?)
  `);
  stmt.run(city_name, city_country, arrival_date, departure_date, stop_order, req.params.id, req.session.userId);
  res.json({ success: true });
});

router.delete('/:id', requireLogin, (req, res) => {
  const stmt = db.prepare(`
    DELETE FROM stops WHERE id = ? AND EXISTS (SELECT 1 FROM trips WHERE trips.id = stops.trip_id AND trips.user_id = ?)
  `);
  stmt.run(req.params.id, req.session.userId);
  res.json({ success: true });
});

module.exports = router;
