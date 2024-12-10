const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (user_id) => {
  const token = jwt.sign({ user_id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15d",
  });

  return token;
};

module.exports = generateToken;
