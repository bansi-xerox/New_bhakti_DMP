const express = require('express');
const router = express.Router();
const {
  getAuthStatus,
  registerUser,
  loginUser,
  forgotPassword,
  activateResetLink,
  resetPassword,
} = require('../controllers/authController');

router.get('/status', getAuthStatus);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.get('/activate-reset/:token', activateResetLink);
router.post('/reset-password/:token', resetPassword);

module.exports = router;