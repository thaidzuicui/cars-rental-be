const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/verifyToken.js"); // Middleware kiểm tra token

// API Like xe
router.post("/like", verifyToken, (req, res) => {
  const { car_id } = req.body; // Lấy ID xe từ request
  const user_id = req.userId; // Lấy user_id từ token (middleware verifyToken)

  if (!car_id) {
    return res.status(400).json({ message: "Car ID is required" });
  }

  // Kiểm tra xem user đã like xe chưa
  const checkQuery = `SELECT * FROM likes WHERE user_id = ? AND car_id = ?`;
  db.query(checkQuery, [user_id, car_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (results.length > 0) {
      return res.status(409).json({ message: "You have already liked this car" });
    }

    // Thêm like vào bảng likes
    const insertQuery = `INSERT INTO likes (user_id, car_id) VALUES (?, ?)`;
    db.query(insertQuery, [user_id, car_id], (err, result) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });

      return res.status(201).json({ message: "Car liked successfully", likeId: result.insertId });
    });
  });
});

// API Unlike xe
router.delete("/like", verifyToken, (req, res) => {
  const { car_id } = req.body;
  const user_id = req.userId;

  if (!car_id) {
    return res.status(400).json({ message: "Car ID is required" });
  }

  // Xóa like khỏi bảng likes
  const deleteQuery = `DELETE FROM likes WHERE user_id = ? AND car_id = ?`;
  db.query(deleteQuery, [user_id, car_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Like not found" });
    }

    return res.status(200).json({ message: "Car unliked successfully" });
  });
});

// API Lấy danh sách xe đã được user like
router.get("/likes", verifyToken, (req, res) => {
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
