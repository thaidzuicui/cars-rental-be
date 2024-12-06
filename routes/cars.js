const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Lấy danh sách xe
router.get('/', (req, res) => {
    const query = 'SELECT * FROM cars';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Lấy chi tiết xe theo `car_id`
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM cars WHERE car_id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

// Thêm xe mới
router.post('/', (req, res) => {
    const { brand, model, body_type, price1day, description } = req.body;
    const query = 'INSERT INTO cars (brand, model, body_type, price1day, description) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [brand, model, body_type, price1day, description], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Car added successfully!', carId: results.insertId });
    });
});

// Cập nhật thông tin xe
router.put('/:id', (req, res) => {
    const { brand, model, body_type, price1day, description } = req.body;
    const query = 'UPDATE cars SET brand = ?, model = ?, body_type = ?, price1day = ?, description = ? WHERE car_id = ?';
    db.query(query, [brand, model, body_type, price1day, description, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Car updated successfully!' });
    });
});

// Xóa xe
router.delete('/:id', (req, res) => {
    const query = 'DELETE FROM cars WHERE car_id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Car deleted successfully!' });
    });
});

module.exports = router;
