const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/verifyToken.js"); // Middleware kiểm tra token

router.post("/like/:car_id", verifyToken, (req, res) => {
  const car_id = req.params.car_id; // Lấy car_id từ URL params
  const user_id = req.userId; // Lấy user_id từ token (middleware verifyToken)

  // Kiểm tra xem car_id có phải là số hợp lệ không
  if (isNaN(car_id)) {
    return res.status(400).json({ message: "Invalid car ID" });
  }

  // Kiểm tra xem car_id có tồn tại trong bảng cars hay không
  const checkCarExistQuery = `SELECT 1 FROM cars WHERE car_id = ? LIMIT 1`;
  db.query(checkCarExistQuery, [car_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Kiểm tra xem user đã like xe chưa
    const checkLikeQuery = `SELECT * FROM likes WHERE user_id = ? AND car_id = ?`;
    db.query(checkLikeQuery, [user_id, car_id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (results.length > 0) {
        // Nếu đã like rồi, thực hiện unlike (xóa like)
        const deleteLikeQuery = `DELETE FROM likes WHERE user_id = ? AND car_id = ?`;
        db.query(deleteLikeQuery, [user_id, car_id], (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }

          return res.status(200).json({
            message: "Car unliked successfully",
          });
        });
      } else {
        // Nếu chưa like, thực hiện like (thêm like vào bảng)
        const insertLikeQuery = `INSERT INTO likes (user_id, car_id) VALUES (?, ?)`;
        db.query(insertLikeQuery, [user_id, car_id], (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }

          return res.status(201).json({
            message: "Car liked successfully",
            likeId: result.insertId,
          });
        });
      }
    });
  });
});

module.exports = router;
