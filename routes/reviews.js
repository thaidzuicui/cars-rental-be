const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Thêm đánh giá xe
router.post('/', (req, res) => {
    const { review, review_score, user_id, car_id } = req.body;
    const query = 'INSERT INTO car_review (review, review_score, user_id, car_id) VALUES (?, ?, ?, ?)';
    db.query(query, [review, review_score, user_id, car_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Review added successfully!', reviewId: results.insertId });
    });
});

module.exports = router;
    