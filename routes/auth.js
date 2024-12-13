const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

router.post("/register", async (req, res) => {
  const { username, full_name, password } = req.body;
  const defaultImage =
    "https://i.pinimg.com/236x/b8/2a/6d/b82a6d7d7db5a9ec0f096db7029330cb.jpg";

  if (!username || !password || !full_name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const checkQuery = `SELECT username FROM users WHERE username = ?`;
    db.query(checkQuery, [username], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: "Username already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `INSERT INTO users (full_name, password, username, profile_image) VALUES (?, ?, ?, ?)`;
      db.query(
        query,
        [full_name, hashedPassword, username, defaultImage],
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }
          return res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId,
          });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error });
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
