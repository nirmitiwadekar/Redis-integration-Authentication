const Otp = require("../models/otpModel");

async function saveOtp(phone, otp) {
  const otpEntry = new Otp({
    phone,
    otp,
    otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // Set expiry 5 min from now
  });

  await otpEntry.save();
  console.log("OTP saved successfully:", otpEntry);
}

module.exports = { saveOtp };
