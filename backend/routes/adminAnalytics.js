const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { getSummary } = require('../controllers/adminAnalyticsController');

// All routes require admin
router.use(auth, admin);

router.get('/summary', getSummary);

module.exports = router; 