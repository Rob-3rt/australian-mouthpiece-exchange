const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  flagContent,
  getAllFlags,
  updateFlagStatus,
  deleteFlag,
  getModerationDashboard
} = require('../controllers/moderationController');

router.post('/flag', auth, flagContent);
router.get('/flags', auth, admin, getAllFlags);
router.patch('/flags/:id', auth, admin, updateFlagStatus);
router.delete('/flags/:id', auth, admin, deleteFlag);
router.get('/dashboard', auth, admin, getModerationDashboard);

module.exports = router; 