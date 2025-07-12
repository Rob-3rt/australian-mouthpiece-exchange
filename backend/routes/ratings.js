const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  createRating,
  getUserRatings,
  getModerationRatings,
  publishRating,
  deleteRating
} = require('../controllers/ratingsController');

router.post('/', auth, createRating);
router.get('/user/:userId', getUserRatings);
router.get('/moderation', auth, admin, getModerationRatings);
router.patch('/:id/publish', auth, admin, publishRating);
router.delete('/:id', auth, admin, deleteRating);

module.exports = router; 