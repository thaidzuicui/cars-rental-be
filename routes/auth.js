const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");



// API Đăng ký tài khoản
router.post("/register", async (req, res) => {
  const { username, full_name, password, email } = req.body;
  const defaultImage =
    "https://i.pinimg.com/236x/b8/2a/6d/b82a6d7d7db5a9ec0f096db7029330cb.jpg";

  // Kiểm tra các trường bắt buộc
  if (!username || !password || !full_name || !email) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Kiểm tra xem email hoặc username đã tồn tại chưa
    const checkQuery = `SELECT username, email FROM users WHERE username = ? OR email = ?`;
    db.query(checkQuery, [username, email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      // Nếu tìm thấy username hoặc email đã tồn tại
      if (results.length > 0) {
        const existingField =
          results[0].username === username ? "Username" : "Email";
        return res
          .status(409)
          .json({ message: `${existingField} already exists` });
      }

      // Hash mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Thêm người dùng mới vào database
      const query = `
        INSERT INTO users (full_name, password, username, email, profile_image) 
        VALUES (?, ?, ?, ?, ?)`;
      db.query(
        query,
        [full_name, hashedPassword, username, email, defaultImage],
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }

          // Phản hồi thành công
          return res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId,
          });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error });
  }
});


router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `SELECT * FROM users WHERE username = ?`;
  db.query(query, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = results[0];

    try {
      // Compare the password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      const token = generateToken(user.user_id);
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      return res.status(500).json({ message: "Database error", error: error });
    }
  });
});

module.exports = router;