const express = require("express");
const router = express.Router();
const axios = require("axios");
const dotenv = require("dotenv");
const { redisClient } = require("../config/redis");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken, verifyToken } = require("../utils/jwt");

dotenv.config();

const TWOFACTOR_API_KEY = process.env.TWOFACTOR_API_KEY;
const OTP_EXPIRY = process.env.OTP_EXPIRY || 300; // 5 min
const ACCESS_TOKEN_EXPIRY = 1800; // 30 min

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (phone, otp) => {
  try {
    await axios.get(`https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${phone}/${otp}/OTPLogin`);
  } catch (error) {
    throw new Error("Failed to send OTP");
  }
};

// 📌 **Send OTP**
router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number is required" });

  try {
    const otp = generateOtp();
    await redisClient.setEx(`otp:${phone}`, OTP_EXPIRY, otp); // Store OTP in Redis

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone, isVerified: false });
      await user.save();
    }

    await sendOtp(phone, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
});

// 📌 **Verify OTP and Generate JWT**
router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP are required" });

  try {
    const storedOtp = await redisClient.get(`otp:${phone}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await redisClient.del(`otp:${phone}`);

    await User.updateOne({ phone }, { isVerified: true });

    const accessToken = generateAccessToken({ phone });
    const refreshToken = generateRefreshToken({ phone });

    await User.updateOne({ phone }, { refreshToken });

    // ✅ Store Access Token in Redis with 30-min expiry
    await redisClient.setEx(`access_token:${phone}`, ACCESS_TOKEN_EXPIRY, accessToken);

    res.status(200).json({ message: "OTP verified, login successful", accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
});

// 📌 **Refresh Token Endpoint**
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

  try {
    const decoded = verifyToken(refreshToken);
    if (!decoded) return res.status(401).json({ message: "Invalid refresh token" });

    const user = await User.findOne({ phone: decoded.phone, refreshToken });
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const newAccessToken = generateAccessToken({ phone: decoded.phone });

    // ✅ Update Access Token in Redis
    await redisClient.setEx(`access_token:${decoded.phone}`, ACCESS_TOKEN_EXPIRY, newAccessToken);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: "Error refreshing token", error: error.message });
  }
});

module.exports = router;
