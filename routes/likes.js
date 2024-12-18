const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/verifyToken.js"); // Middleware kiểm tra token

// API Like xe
router.post("/like/:id", verifyToken, (req, res) => {
  const carId = req.params.id; // Lấy car_id từ URL
  const userId = req.userId; // Lấy user_id từ token

  // Kiểm tra xem user đã like xe này chưa
  const checkQuery = "SELECT * FROM likes WHERE car_id = ? AND user_id = ?";
  db.query(checkQuery, [carId, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length > 0) {
      // Nếu đã like rồi thì trả về thông báo
      return res.status(400).json({ message: "You have already liked this car" });
    }

    // Thêm like mới
    const insertQuery = "INSERT INTO likes (car_id, user_id) VALUES (?, ?)";
    db.query(insertQuery, [carId, userId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(201).json({
        message: "Car liked successfully",
        likeId: result.insertId,
      });
    });
  });
});

// API Unlike xe
router.delete("/like/:id", verifyToken, (req, res) => {
  const carId = req.params.id; // Lấy car_id từ URL
  const userId = req.userId; // Lấy user_id từ token sau middleware

  // Kiểm tra input
  if (!carId) {
    return res.status(400).json({ message: "Car ID is required" });
  }

  const query = `DELETE FROM likes WHERE car_id = ? AND user_id = ?`;

  db.query(query, [carId, userId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    // Kiểm tra xem like đã tồn tại không
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Like not found or already deleted",
      });
    }

    res.status(200).json({
      message: "Like removed successfully",
      car_id: carId,
      user_id: userId,
    });
  });
});

// API Lấy danh sách xe đã được user like
router.get("/listLike", verifyToken, (req, res) => {
  const user_id = req.userId;

  const query = `
    SELECT c.car_id, c.brand, c.model, c.body_type, c.maximum_gasoline, c.transmission_type, c.location, c.price1day, c.description 
    FROM cars c
    INNER JOIN likes l ON c.car_id = l.car_id
    WHERE l.user_id = ?
  `;
  db.query(query, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    return res.status(200).json({ message: "Liked cars retrieved successfully", cars: results });
  });
});

module.exports = router;
