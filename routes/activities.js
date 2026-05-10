const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const { validateActivity } = require('../middleware/validation');

router.get('/', requireLogin, (req, res) => {
  const activities = db.prepare(`
    SELECT activities.* FROM activities 
    JOIN stops ON activities.stop_id = stops.id 
    JOIN trips ON stops.trip_id = trips.id 
    WHERE trips.user_id = ? AND activities.stop_id = ?
  `).all(req.session.userId, req.query.stop_id);
  res.json(activities);
});

router.post('/', requireLogin, validateActivity, (req, res) => {
  const { name, cost, activity_time, category, stop_id } = req.body;
  const stmt = db.prepare('INSERT INTO activities (name, cost, activity_time, category, stop_id) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(name, cost, activity_time, category, stop_id);
  res.json({ id: info.lastInsertRowid });
});

router.put('/:id', requireLogin, validateActivity, (req, res) => {
  const { name, cost, activity_time, category } = req.body;
  const stmt = db.prepare(`
    UPDATE activities SET name = ?, cost = ?, activity_time = ?, category = ? 
    WHERE id = ? AND EXISTS (
      SELECT 1 FROM stops 
      JOIN trips ON stops.trip_id = trips.id 
      WHERE stops.id = activities.stop_id AND trips.user_id = ?
    )
  `);
  stmt.run(name, cost, activity_time, category, req.params.id, req.session.userId);
  res.json({ success: true });
});

router.delete('/:id', requireLogin, (req, res) => {
  const stmt = db.prepare(`
    DELETE FROM activities WHERE id = ? AND EXISTS (
      SELECT 1 FROM stops 
      JOIN trips ON stops.trip_id = trips.id 
      WHERE stops.id = activities.stop_id AND trips.user_id = ?
    )
  `);
  stmt.run(req.params.id, req.session.userId);
  res.json({ success: true });
});

module.exports = router;
