const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Lấy danh sách người dùng
router.get('/', (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Thêm người dùng mới
router.post('/', (req, res) => {
    const { username, first_name, last_name, email } = req.body;
    const query = 'INSERT INTO users (username, first_name, last_name, email) VALUES (?, ?, ?, ?)';
    db.query(query, [username, first_name, last_name, email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User added successfully!', userId: results.insertId });
    });
});

module.exports = router;
