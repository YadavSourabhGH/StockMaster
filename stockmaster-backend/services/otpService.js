const axios = require('axios');
const OTPRequest = require('../models/OTPRequest');
const User = require('../models/User');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const requestOTP = async (email, type = 'reset') => {
  // Check if user exists
  const user = await User.findOne({ email: email.toLowerCase() });

  // For registration, user might not exist yet, so we don't check user existence if type is 'verification'
  if (!user && type !== 'verification') {
    // Still return success to prevent email enumeration
    return { success: true, message: 'If email exists, OTP has been sent' };
  }

  // Check for recent OTP request (prevent spam - 30 seconds cooldown)
  const recentRequest = await OTPRequest.findOne({
    email: email.toLowerCase(),
    createdAt: { $gte: new Date(Date.now() - 30 * 1000) },
    used: false,
  });

  if (recentRequest) {
    return {
      success: false,
      message: 'Please wait 30 seconds before requesting another OTP',
    };
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Invalidate previous unused OTPs for this email
  await OTPRequest.updateMany(
    { email: email.toLowerCase(), used: false },
    { used: true }
  );

  // Save new OTP
  const otpRequest = new OTPRequest({
    email: email.toLowerCase(),
    otp,
    expiresAt,
  });
  await otpRequest.save();

  // Call n8n webhook
  try {
    let subject = 'StockMaster - OTP';
    let messageBody = `Your OTP is: ${otp}`;

    if (type === 'verification') {
      subject = 'StockMaster - Verify Your Email';
      messageBody = `Welcome to StockMaster! Your email verification OTP is: ${otp}`;
    } else if (type === 'login') {
      subject = 'StockMaster - Login OTP';
      messageBody = `Your login OTP is: ${otp}`;
    } else if (type === 'reset') {
      subject = 'StockMaster - Password Reset OTP';
      messageBody = `Your OTP for password reset is: ${otp}`;
    }

    const message = `${messageBody}\n\nThis OTP will expire in 5 minutes.\n\nIf you didn't request this, please ignore this email.`;
    const webhookUrl = `${process.env.N8N_WEBHOOK_URL}?email=${encodeURIComponent(email)}&sub=${encodeURIComponent(subject)}&message=${encodeURIComponent(message)}`;

    console.log(`Sending OTP to ${email} via webhook...`);
    await axios.get(webhookUrl, { timeout: 5000 });
    // Ignore response as per PRD (always returns {"message":"Workflow was started"})
  } catch (error) {
    // Log error but don't fail the request
    console.error('n8n webhook error:', error.message);
    // For development, log OTP to console if webhook fails
    console.log(`[DEV] OTP for ${email}: ${otp}`);
  }

  return { success: true, message: 'OTP sent successfully' };
};

const verifyOTP = async (email, otp) => {
  const otpRequest = await OTPRequest.findOne({
    email: email.toLowerCase(),
    otp,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRequest) {
    return { valid: false, message: 'Invalid or expired OTP' };
  }

  // Mark as used
  otpRequest.used = true;
  await otpRequest.save();

  return { valid: true };
};

module.exports = { requestOTP, verifyOTP };

