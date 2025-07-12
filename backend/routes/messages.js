const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  getConversations,
  getConversation,
  sendMessage,
  markAsRead,
  getModerationMessages,
  reviewMessage,
  deleteMessage
} = require('../controllers/messagesController');

router.get('/', auth, getConversations);
router.get('/conversation/:userId', auth, getConversation);
router.post('/', auth, sendMessage);
router.patch('/:id/read', auth, markAsRead);
router.get('/moderation', auth, admin, getModerationMessages);
router.patch('/:id/review', auth, admin, reviewMessage);
router.delete('/:id', auth, admin, deleteMessage);

module.exports = router; 