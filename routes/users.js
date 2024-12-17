const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/verifyToken.js");
const multer = require("multer");
const { storage } = require("../config/cloudinary.js");
const upload = multer({ storage });

// API lấy thông tin người dùng hiện tại
router.get("/currentUser", verifyToken, (req, res) => {
  const userId = req.userId; // Lấy userId từ token

  const query =
    "SELECT user_id, full_name, username, email, profile_image FROM users WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];
    return res
      .status(200)
      .json({ message: "User retrieved successfully", user });
  });
});

// API sửa profile
router.put(
  "/updateProfile",
  verifyToken,
  upload.single("image"),
  (req, res) => {
    const userId = req.userId; // Lấy userId từ token (middleware verifyToken đã thêm userId)
    const { username, email, full_name } = req.body;
    const profileImage = req.file?.path; // Đường dẫn ảnh trên Cloudinary

    // Kiểm tra dữ liệu đầu vào
    if (!username || !email || !full_name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Kiểm tra username/email đã tồn tại hay chưa (trừ chính người dùng đang sửa)
    const checkQuery = `
    SELECT * FROM users WHERE (username = ? OR email = ?) AND user_id != ?;
  `;
    db.query(checkQuery, [username, email, userId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (results.length > 0) {
        return res.status(409).json({
          message: "Username or email already exists",
        });
      }

      // Cập nhật thông tin người dùng
      const updateQuery = `
      UPDATE users
      SET username = ?, email = ?, full_name = ?, profile_image = COALESCE(?, profile_image)
      WHERE user_id = ?;
    `;

      db.query(
        updateQuery,
        [username, email, full_name, profileImage, userId],
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
          }

          return res.status(200).json({
            message: "Profile updated successfully",
            userId: userId,
          });
        }
      );
    });
  }
);

module.exports = router;
