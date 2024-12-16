const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage: storage });

// Lấy danh sách xe
router.get('/currentCar', (req, res) => {
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
router.put('/updateCar', (req, res) => {
    const { brand, model, body_type, price1day, description } = req.body;
    const query = 'UPDATE cars SET brand = ?, model = ?, body_type = ?, price1day = ?, description = ? WHERE car_id = ?';
    db.query(query, [brand, model, body_type, price1day, description, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Car updated successfully!' });
    });
});

// Xóa xe
router.delete('/:DeleteCar', (req, res) => {
    const query = 'DELETE FROM cars WHERE car_id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Car deleted successfully!' });
    });
});


// API thêm xe cho thuê
router.post("/addCar", upload.single("image"), (req, res) => {
  console.log("Body: ", req.body); // Log toàn bộ dữ liệu gửi lên
  console.log("File: ", req.file); // Log file upload
  
  const {
    brand,
    model,
    body_type,
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
    !body_type ||
    !maximum_gasoline ||
    !transmission_type ||
    !location ||
    !price1day ||
    !description ||
    !imageUrl
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Query thêm xe vào bảng cars
  const carQuery = `
    INSERT INTO cars (
      brand, model, body_type, maximum_gasoline, transmission_type, location, price1day, description
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    carQuery,
    [
      brand,
      model,
      body_type,
      maximum_gasoline,
      transmission_type,
      location,
      price1day,
      description,
    ],
    (err, carResult) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      const carId = carResult.insertId; // Lấy car_id của xe vừa thêm

      // Query thêm ảnh vào bảng car_imgs
      const imgQuery = `
        INSERT INTO car_imgs (img_url, car_id)
        VALUES (?, ?)`;

      db.query(imgQuery, [imageUrl, carId], (imgErr, imgResult) => {
        if (imgErr) {
          return res
            .status(500)
            .json({ message: "Failed to save image", error: imgErr });
        }

        res.status(201).json({
          message: "Car added successfully",
          carId: carId,
          imageUrl: imageUrl,
        });
      });
    }
  );
});

module.exports = router;
