const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/verifyToken');

// API thuê xe
router.post("/rentCar/:car_id", verifyToken, (req, res) => {
  const { car_id } = req.params; // Lấy car_id từ URL
  const user_id = req.userId; // Lấy user_id từ token
  const { rental_date, return_date, payment_amount } = req.body;

  // Kiểm tra các trường dữ liệu đầu vào
  if (!car_id || !rental_date || !return_date || !payment_amount) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Kiểm tra xem xe có tồn tại trong bảng `cars` không
  const checkCarQuery = "SELECT * FROM cars WHERE car_id = ?";
  db.query(checkCarQuery, [car_id], (err, carResults) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (carResults.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Thêm giao dịch thuê xe vào bảng `rental`
    const rentCarQuery = `
      INSERT INTO rental (
        rental_date, return_date, car_id, user_id, payment_amount, rental_status
      ) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(
      rentCarQuery,
      [rental_date, return_date, car_id, user_id, payment_amount, 1], // 1 = đang thuê
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Database error", error: err });
        }

        return res.status(201).json({
          message: "Car rented successfully",
          rentalId: result.insertId,
        });
      }
    );
  });
});

// Lấy danh sách thuê xe
router.get('/ListRental', (req, res) => {
    const query = 'SELECT * FROM rental';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// API lấy danh sách xe được thuê nhiều nhất
router.get("/mostRentedCars", (req, res) => {
    const query = `
      SELECT 
        c.car_id,
        c.brand,
        c.model,
        c.body_type,
        c.price1day,
        COUNT(r.rental_id) AS rental_count
      FROM 
        cars c
      JOIN 
        rental r ON c.car_id = r.car_id
      GROUP BY 
        c.car_id
      ORDER BY 
        rental_count DESC
      LIMIT 10
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
  
      res.status(200).json({
        message: "Top rented cars retrieved successfully",
        cars: results,
      });
    });
  });

module.exports = router;
