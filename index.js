const express = require("express");
const bodyParser = require("body-parser");
const db = require("./config/db");
const cors = require("cors");
const app = express();
const path = require("path");

const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORTT || 3001;
// Middleware
app.use(bodyParser.json());

app.use(cors());
app.use(express.static(path.join(__dirname, "dist")));

// Routes
app.use("/api/cars", require("./routes/cars"));
app.use("/api/users", require("./routes/users"));
app.use("/api/rentals", require("./routes/rentals"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/likes", require("./routes/likes"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
