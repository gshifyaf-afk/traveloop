const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.get('/:tripId', requireLogin, (req, res) => {
  const tripId = req.params.tripId;
  const userId = req.session.userId;

  // Check trip ownership
  const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(tripId, userId);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const activities = db.prepare(`
    SELECT activities.*, stops.city_name, stops.arrival_date FROM activities 
    JOIN stops ON activities.stop_id = stops.id 
    WHERE stops.trip_id = ?
  `).all(tripId);

  const totalCost = activities.reduce((sum, act) => sum + (act.cost || 0), 0);
  
  const categorySum = {};
  activities.forEach(act => {
    const cat = act.category || 'Other';
    categorySum[cat] = (categorySum[cat] || 0) + (act.cost || 0);
  });

  // Calculate daily costs to check for alerts
  const dailyCosts = {};
  activities.forEach(act => {
    const date = act.arrival_date || 'Unknown';
    dailyCosts[date] = (dailyCosts[date] || 0) + (act.cost || 0);
  });

  const alerts = Object.keys(dailyCosts).filter(date => dailyCosts[date] > 5000).map(date => `Spending exceeded ₹5000 on ${date}`);

  res.json({
    totalCost,
    categorySum,
    dailyCosts,
    alerts,
    tripName: trip.name
  });
});

module.exports = router;
