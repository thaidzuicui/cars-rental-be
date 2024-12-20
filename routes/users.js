const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/verifyToken.js");
const multer = require("multer");
const { storage } = require("../middleware/cloudinary.js");
const upload = multer({ storage });
const {
  sendVerificationCode,
  verifyCode,
  clearCode,
} = require("../middleware/resetPasswordService.js");
const bcrypt = require("bcrypt");
const redisClient = require("../middleware/redisClient");
const {
  getAsync,
  delAsync,
  setexAsync,
  setAsync,
} = require("../middleware/redisClient.js");
const crypto = require("crypto");

// API lấy thông tin người dùng hiện tại
router.get("/currentUser", verifyToken, (req, res) => {
  const userId = req.userId; // Lấy userId từ token

  const query =
    "SELECT user_id, full_name, username, email, profile_image, bio FROM users WHERE user_id = ?";
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
    const { username, email, full_name, bio } = req.body;
    const profileImage = req.file?.path; // Đường dẫn ảnh trên Cloudinary

    // Kiểm tra dữ liệu đầu vào
    if (!username || !full_name) {
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
      SET username = ?, email = ?, full_name = ?, bio = ?, profile_image = COALESCE(?, profile_image)
      WHERE user_id = ?;
    `;

      db.query(
        updateQuery,
        [username, email, full_name, bio, profileImage, userId],
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

// API gửi email reset password

// router.post("/forgotPassword", (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ message: "Please provide an email" });
//   }

//   // Kiểm tra email trong database
//   const query = "SELECT * FROM users WHERE email = ?";
//   db.query(query, [email], (err, results) => {
//     if (err) return res.status(500).json({ message: "Database error", error: err });

//     if (results.length === 0) {
//       return res.status(404).json({ message: "Email not found" });
//     }

//     // Tạo mã xác thực ngẫu nhiên (6 chữ số)
//     const verificationCode = crypto.randomInt(100000, 999999).toString();

//     // Lưu mã xác thực vào Redis với thời gian hết hạn là 10 phút
//     redisClient.set(`resetPassword:${email}`, verificationCode, {
//       EX: 600, // Thời gian hết hạn (600 giây = 10 phút)
//     });

//     // Gửi mã xác nhận qua email (giả định)
//     console.log(`Verification code for ${email}: ${verificationCode}`);

//     return res.json({ message: "Verification code sent to email" });
//   });
// });

// // API đặt lại mật khẩu
// router.post("/resetPassword", async (req, res) => {
//   const { email, code, newPassword } = req.body;

//   if (!email || !code || !newPassword) {
//     return res.status(400).json({
//       message: "Email, verification code, and new password are required.",
//     });
//   }

//   try {
//     // Lấy mã từ Redis
//     const savedCode = await getAsync(`resetPassword:${email}`);
//     if (!savedCode || savedCode !== code) {
//       await delAsync(`resetPassword:${email}`); // Xóa mã nếu sai
//       return res.status(400).json({ message: "Invalid or expired verification code" });
//     }

//     // Mã hóa mật khẩu mới
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Cập nhật mật khẩu vào database
//     const query = "UPDATE users SET password = ? WHERE email = ?";
//     db.query(query, [hashedPassword, email], async (err, result) => {
//       if (err) {
//         console.error("Database error:", err);
//         return res.status(500).json({ message: "Database error", error: err });
//       }

//       if (result.affectedRows === 0) {
//         return res.status(404).json({ message: "Email not found" });
//       }

//       // Xóa mã xác thực khỏi Redis
//       await delAsync(`resetPassword:${email}`);

//       return res.json({ message: "Password reset successfully" });
//     });
//   } catch (error) {
//     console.error("Error resetting password:", error);
//     return res
//       .status(500)
//       .json({ message: "Error resetting password", error: error.message });
//   }
// });

module.exports = router;
