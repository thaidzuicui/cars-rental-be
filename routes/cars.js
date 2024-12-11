const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

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



// API thêm xe cho thuê
router.post("/addCar", upload.single("image"), (req, res) => {
  const {
    brand,
    model,
    date,
    body_type,
    available_from,
    available_to,
    maximum_gasoline,
    transmission_type,
    location,
    price1day,
    description,
  } = req.body;

  const imageUrl = req.file?.path; // Đường dẫn ảnh trên Cloudinary

  // Kiểm tra dữ liệu đầu vào
  if (
    !brand ||
    !model ||
    !date ||
    !body_type ||
    !available_from ||
    !available_to ||
    !maximum_gasoline ||
    !transmission_type ||
    !location ||
    !price1day ||
    !description ||
    !imageUrl
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    INSERT INTO cars (
      brand, model, date, body_type, available_from, available_to,
      maximum_gasoline, transmission_type, location, price1day, description, image_url
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [
      brand,
      model,
      date,
      body_type,
      available_from,
      available_to,
      maximum_gasoline,
      transmission_type,
      location,
      price1day,
      description,
      imageUrl,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(201).json({
        message: "Car added successfully",
        carId: result.insertId,
        imageUrl: imageUrl,
      });
    }
  );
});

module.exports = router;

module.exports = router;
