const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, getCurrentUser } = require('../controllers/authController');

const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', require('../controllers/authController').verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', auth, getCurrentUser);

module.exports = router; 