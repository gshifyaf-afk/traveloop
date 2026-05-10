const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

router.put('/profile', requireLogin, (req, res) => {
    const { name, email, language, currency, saved_destinations } = req.body;
    
    try {
        db.prepare(`
            UPDATE users 
            SET name = ?, email = ?, language = ?, currency = ?, saved_destinations = ?
            WHERE id = ?
        `).run(name, email, language, currency, saved_destinations, req.session.userId);
        
        req.session.userName = name; // Update session
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
