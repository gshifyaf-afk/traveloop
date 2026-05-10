const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.get('/:tripId', requireLogin, (req, res) => {
  const notes = db.prepare(`
    SELECT trip_notes.* FROM trip_notes 
    JOIN trips ON trip_notes.trip_id = trips.id 
    WHERE trips.user_id = ? AND trip_notes.trip_id = ?
    ORDER BY created_at DESC
  `).all(req.session.userId, req.params.tripId);
  res.json(notes);
});

router.post('/', requireLogin, (req, res) => {
  const { note_text, trip_id } = req.body;
  const stmt = db.prepare('INSERT INTO trip_notes (note_text, trip_id) VALUES (?, ?)');
  const info = stmt.run(note_text, trip_id);
  res.json({ id: info.lastInsertRowid, created_at: new Date().toISOString() });
});

router.delete('/:id', requireLogin, (req, res) => {
  const stmt = db.prepare(`
    DELETE FROM trip_notes WHERE id = ? AND EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_notes.trip_id AND trips.user_id = ?)
  `);
  stmt.run(req.params.id, req.session.userId);
  res.json({ success: true });
});

module.exports = router;
