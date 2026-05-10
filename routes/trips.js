const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const { validateTrip } = require('../middleware/validation');
const { v4: uuidv4 } = require('uuid');

router.get('/', requireLogin, (req, res) => {
  const trips = db.prepare('SELECT * FROM trips WHERE user_id = ?').all(req.session.userId);
  res.json(trips);
});

router.post('/', requireLogin, validateTrip, (req, res) => {
  const { name, start_date, end_date, description } = req.body;
  const public_token = uuidv4();
  const stmt = db.prepare('INSERT INTO trips (name, start_date, end_date, description, user_id, public_token) VALUES (?, ?, ?, ?, ?, ?)');
  const info = stmt.run(name, start_date, end_date, description, req.session.userId, public_token);
  res.json({ id: info.lastInsertRowid, public_token });
});

router.put('/:id', requireLogin, validateTrip, (req, res) => {
  const { name, start_date, end_date, description } = req.body;
  const stmt = db.prepare('UPDATE trips SET name = ?, start_date = ?, end_date = ?, description = ? WHERE id = ? AND user_id = ?');
  stmt.run(name, start_date, end_date, description, req.params.id, req.session.userId);
  res.json({ success: true });
});

router.delete('/:id', requireLogin, (req, res) => {
  const stmt = db.prepare('DELETE FROM trips WHERE id = ? AND user_id = ?');
  stmt.run(req.params.id, req.session.userId);
  res.json({ success: true });
});

module.exports = router;
