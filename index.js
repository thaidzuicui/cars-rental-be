const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

app.use(cors());

// Routes
app.use("/api/cars", require("./routes/cars"));
app.use("/api/users", require("./routes/users"));
app.use("/api/rentals", require("./routes/rentals"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/likes", require("./routes/likes"));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
