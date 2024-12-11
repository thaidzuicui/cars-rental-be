const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/verifyToken.js");

// API lấy thông tin người dùng hiện tại
router.get("/currentUser", verifyToken, (req, res) => {
  const userId = req.userId; // Lấy userId từ token

  const query = "SELECT user_id, first_name, last_name, username, email, profile_image FROM users WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];
    return res.status(200).json({ message: "User retrieved successfully", user });
  });
});

module.exports = router;



