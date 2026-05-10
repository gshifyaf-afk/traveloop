module.exports = {
    validateTrip: (req, res, next) => {
        const { name, start_date, end_date } = req.body;
        if (!name || name.trim().length < 3) {
            return res.status(400).json({ error: 'Trip name must be at least 3 characters long.' });
        }
        if (new Date(start_date) > new Date(end_date)) {
            return res.status(400).json({ error: 'Start date cannot be after end date.' });
        }
        next();
    },
    validateStop: (req, res, next) => {
        const { city_name, arrival_date, departure_date } = req.body;
        if (!city_name || city_name.trim().length < 2) {
            return res.status(400).json({ error: 'City name is required.' });
        }
        if (new Date(arrival_date) > new Date(departure_date)) {
            return res.status(400).json({ error: 'Arrival date cannot be after departure date.' });
        }
        next();
    },
    validateActivity: (req, res, next) => {
        const { name, cost } = req.body;
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Activity name is required.' });
        }
        if (isNaN(cost) || cost < 0) {
            return res.status(400).json({ error: 'Cost must be a positive number.' });
        }
        next();
    }
};
