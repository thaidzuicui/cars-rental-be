const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

// Lưu mã xác nhận tạm thời (có thể thay bằng Redis/DB)
const verificationCodes = {};

// Gửi mã xác nhận qua email
const sendVerificationCode = async (email) => {
  const code = Math.floor(100000 + Math.random() * 900000); // Tạo mã 6 số
  const expiresAt = Date.now() + 15 * 60 * 1000; // Hết hạn sau 15 phút

  verificationCodes[email] = { code, expiresAt };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Verification Code",
    text: `Your verification code is: ${code}. This code will expire in 15 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

// Xác minh mã xác nhận
const verifyCode = (email, code) => {
  const stored = verificationCodes[email];
  if (!stored || stored.expiresAt < Date.now()) return false;
  return stored.code.toString() === code.toString();
};

// Xóa mã xác nhận sau khi sử dụng
const clearCode = (email) => {
  delete verificationCodes[email];
};

module.exports = { sendVerificationCode, verifyCode, clearCode };
