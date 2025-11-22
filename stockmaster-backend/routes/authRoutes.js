const express = require('express');
const router = express.Router();
const {
  signup,
  verifyEmail,
  login,
  loginWithOtp,
  verifyLoginOtp,
  requestPasswordReset,
  resetPassword,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/login-otp', loginWithOtp);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/request-otp', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;
