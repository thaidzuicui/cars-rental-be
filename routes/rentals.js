const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Thuê xe
router.post('/', (req, res) => {
    const { rental_date, car_id, user_id, payment_amount } = req.body;
    const query = 'INSERT INTO rental (rental_date, car_id, user_id, payment_amount) VALUES (?, ?, ?, ?)';
    db.query(query, [rental_date, car_id, user_id, payment_amount], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Rental created successfully!', rentalId: results.insertId });
    });
});

// Lấy danh sách thuê xe
router.get('/', (req, res) => {
    const query = 'SELECT * FROM rental';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;
