const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.get('/:tripId', requireLogin, (req, res) => {
  const items = db.prepare(`
    SELECT checklist_items.* FROM checklist_items 
    JOIN trips ON checklist_items.trip_id = trips.id 
    WHERE trips.user_id = ? AND checklist_items.trip_id = ?
  `).all(req.session.userId, req.params.tripId);
  res.json(items);
});

router.post('/', requireLogin, (req, res) => {
  const { item_name, category, trip_id } = req.body;
  const stmt = db.prepare('INSERT INTO checklist_items (item_name, category, trip_id) VALUES (?, ?, ?)');
  const info = stmt.run(item_name, category, trip_id);
  res.json({ id: info.lastInsertRowid });
});

router.put('/:id', requireLogin, (req, res) => {
  const { is_packed } = req.body;
  const stmt = db.prepare(`
    UPDATE checklist_items SET is_packed = ? 
    WHERE id = ? AND EXISTS (SELECT 1 FROM trips WHERE trips.id = checklist_items.trip_id AND trips.user_id = ?)
  `);
  stmt.run(is_packed ? 1 : 0, req.params.id, req.session.userId);
  res.json({ success: true });
});

router.delete('/:id', requireLogin, (req, res) => {
  const stmt = db.prepare(`
    DELETE FROM checklist_items WHERE id = ? AND EXISTS (SELECT 1 FROM trips WHERE trips.id = checklist_items.trip_id AND trips.user_id = ?)
  `);
  stmt.run(req.params.id, req.session.userId);
  res.json({ success: true });
});

module.exports = router;
