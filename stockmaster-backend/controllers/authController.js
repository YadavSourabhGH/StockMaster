const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requestOTP, verifyOTP } = require('../services/otpService');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        error: { code: 'USER_EXISTS' },
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user (default role: manager, verified: false)
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'manager',
      verified: false,
    });

    await user.save();

    // Send Verification OTP
    await requestOTP(email, 'verification');

    res.status(201).json({
      success: true,
      message: 'User created successfully. Please verify your email.',
      data: {
        requiresVerification: true,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: { details: error.message },
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    const otpResult = await verifyOTP(email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({
        success: false,
        message: otpResult.message,
        error: { code: 'INVALID_OTP' },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: { code: 'USER_NOT_FOUND' },
      });
    }

    user.verified = true;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: { details: error.message },
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: { code: 'INVALID_CREDENTIALS' },
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: { code: 'INVALID_CREDENTIALS' },
      });
    }

    // Check verification
    if (!user.verified) {
      // Optional: Resend OTP if not verified?
      // For now, just block
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email.',
        error: { code: 'NOT_VERIFIED' }
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: { details: error.message },
    });
  }
};

const loginWithOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        error: { code: 'VALIDATION_ERROR' }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: { code: 'USER_NOT_FOUND' }
      });
    }

    const result = await requestOTP(email, 'login');

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: { code: 'OTP_REQUEST_ERROR' }
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: { email }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error requesting OTP',
      error: { details: error.message }
    });
  }
};

const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
        error: { code: 'VALIDATION_ERROR' }
      });
    }

    const otpResult = await verifyOTP(email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({
        success: false,
        message: otpResult.message,
        error: { code: 'INVALID_OTP' }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: { code: 'USER_NOT_FOUND' }
      });
    }

    // If logging in with OTP, we can auto-verify the user if not already verified
    if (!user.verified) {
      user.verified = true;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: { details: error.message }
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    const result = await requestOTP(email, 'reset');

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: { code: 'OTP_REQUEST_ERROR' },
      });
    }

    res.json({
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error requesting OTP',
      error: { details: error.message },
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    // Verify OTP
    const otpResult = await verifyOTP(email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({
        success: false,
        message: otpResult.message,
        error: { code: 'INVALID_OTP' },
      });
    }

    // Find user and update password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: { code: 'USER_NOT_FOUND' },
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: { details: error.message },
    });
  }
};

module.exports = {
  signup,
  verifyEmail,
  login,
  loginWithOtp,
  verifyLoginOtp,
  requestPasswordReset,
  resetPassword,
};
