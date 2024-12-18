const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/verifyToken');

// API thêm review cho xe
router.post("/review/:car_id", verifyToken, (req, res) => {
    const { car_id } = req.params;
    const { review_score, review } = req.body;
    const user_id = req.userId; // Lấy user_id từ token
 
    console.log(car_id, user_id, review_score, review);
    // Kiểm tra đầu vào
    if (!car_id || !user_id || !review_score || typeof review_score !== "number") {
      return res.status(400).json({ message: "Missing or invalid required fields." });
    }
  
    // Thêm review vào database
    const query = `
      INSERT INTO car_review (car_id, user_id, review_score, review, date)
      VALUES (?, ?, ?, ?, NOW())
    `;
    db.query(query, [car_id, user_id, review_score, review || null], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
  
      return res.status(201).json({
        message: "Review added successfully",
        reviewId: result.insertId,
      });
    });
  });
  

  // API lấy danh sách review của xe
router.get("/reviews/:car_id", (req, res) => {
    const { car_id } = req.params;
  
    // Kiểm tra đầu vào
    if (!car_id) {
      return res.status(400).json({ message: "Car ID is required." });
    }
  
    // Lấy danh sách review từ database
    const query = `
      SELECT 
        r.review_id, r.review_score, r.review, r.date, 
        u.full_name AS reviewer_name
      FROM car_review r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.car_id = ?
      ORDER BY r.date DESC
    `;
    db.query(query, [car_id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
  
      return res.json({
        message: "Reviews fetched successfully",
        reviews: results,
      });
    });
  });

module.exports = router;
    