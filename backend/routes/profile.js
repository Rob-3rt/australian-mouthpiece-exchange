const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, getUserProfile } = require('../controllers/profileController');
const auth = require('../middleware/auth');

router.get('/me', auth, getMyProfile);
router.put('/me', auth, updateMyProfile);
router.get('/:userId', getUserProfile);

module.exports = router; 