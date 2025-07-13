const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const socketService = require('../utils/socketService');
const notificationService = require('../utils/notificationService');

// Get all conversations for the current user, grouped by other user and listing_id
exports.getConversations = async (req, res) => {
  try {
    const { listing_id } = req.query;
    const where = {
      OR: [
        { from_user_id: req.user.userId },
        { to_user_id: req.user.userId }
      ]
    };
    if (listing_id) {
      where.listing_id = Number(listing_id);
    }
    const conversations = await prisma.message.findMany({
      where,
      include: {
        from_user: { select: { user_id: true, name: true, nickname: true } },
        to_user: { select: { user_id: true, name: true, nickname: true } }
      },
      orderBy: { timestamp: 'desc' }
    });
    // Group by conversation partner and listing_id
    const conversationMap = new Map();
    for (const msg of conversations) {
      const partnerId = msg.from_user_id === req.user.userId ? msg.to_user_id : msg.from_user_id;
      const partner = msg.from_user_id === req.user.userId ? msg.to_user : msg.from_user;
      const key = `${partnerId}_${msg.listing_id || 'none'}`;
      if (!conversationMap.has(key)) {
        let listingDetails = null;
        if (msg.listing_id) {
          // Fetch listing details
          try {
            listingDetails = await prisma.listing.findUnique({
              where: { listing_id: msg.listing_id },
              select: { brand: true, model: true, photos: true }
            });
          } catch {}
        }
        conversationMap.set(key, {
          other_user: partner,
          conversation_id: partnerId, // This is the user ID of the conversation partner
          listing_id: msg.listing_id,
          listing_brand: listingDetails?.brand || null,
          listing_model: listingDetails?.model || null,
          listing_photo: listingDetails?.photos?.[0] || null,
          last_message_preview: msg.content || msg.message, // fallback for legacy
          updated_at: msg.timestamp,
          unreadCount: 0
        });
      }
      if (msg.to_user_id === req.user.userId && !msg.read) {
        conversationMap.get(key).unreadCount++;
      }
      // Update last message if this one is newer
      if (msg.timestamp > conversationMap.get(key).updated_at) {
        conversationMap.get(key).last_message_preview = msg.content || msg.message;
        conversationMap.get(key).updated_at = msg.timestamp;
      }
    }
    const result = Array.from(conversationMap.values());
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
};

// Get conversation with a specific user and listing
exports.getConversation = async (req, res) => {
  try {
    const { listing_id } = req.query;
    const where = {
      OR: [
        { from_user_id: req.user.userId, to_user_id: Number(req.params.userId) },
        { from_user_id: Number(req.params.userId), to_user_id: req.user.userId }
      ]
    };
    if (listing_id) {
      where.listing_id = Number(listing_id);
    }
    const messages = await prisma.message.findMany({
      where,
      include: {
        from_user: { select: { user_id: true, name: true, nickname: true } },
        to_user: { select: { user_id: true, name: true, nickname: true } }
      },
      orderBy: { timestamp: 'asc' }
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation.' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { to_user_id, content, listing_id } = req.body;
    if (!to_user_id || !content) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Get sender and recipient details
    const [sender, recipient] = await Promise.all([
      prisma.user.findUnique({
        where: { user_id: req.user.userId },
        select: { user_id: true, name: true, nickname: true, email: true }
      }),
      prisma.user.findUnique({
        where: { user_id: Number(to_user_id) },
        select: { user_id: true, name: true, nickname: true, email: true }
      })
    ]);

    if (!sender || !recipient) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Get listing details if provided
    let listing = null;
    if (listing_id) {
      listing = await prisma.listing.findUnique({
        where: { listing_id: Number(listing_id) },
        select: { listing_id: true, brand: true, model: true }
      });
    }

    const message = await prisma.message.create({
      data: {
        from_user_id: req.user.userId,
        to_user_id: Number(to_user_id),
        content,
        flagged: false,
        reviewed: false,
        listing_id: listing_id ? Number(listing_id) : null
      },
      include: {
        from_user: { select: { user_id: true, name: true, nickname: true } },
        to_user: { select: { user_id: true, name: true, nickname: true } }
      }
    });

    // Send real-time notification
    const recipientOnline = socketService.sendMessageNotification(message, sender, recipient, listing);

    // Send email notification if recipient is offline and email is configured
    if (!recipientOnline && notificationService.isEmailConfigured()) {
      // Don't await this to avoid blocking the response
      notificationService.sendMessageNotification(recipient, sender, content, listing)
        .catch(err => console.error('Failed to send email notification:', err));
    }

    res.status(201).json(message);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const message = await prisma.message.findUnique({
      where: { message_id: Number(req.params.id) }
    });
    if (!message) return res.status(404).json({ error: 'Message not found.' });
    if (message.to_user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    const updated = await prisma.message.update({
      where: { message_id: Number(req.params.id) },
      data: { read: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark message as read.' });
  }
};

// Get messages for moderation (admin only)
exports.getModerationMessages = async (req, res) => {
  try {
    // TODO: Add admin check here
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { flagged: true },
          { reviewed: false }
        ]
      },
      include: {
        from_user: { select: { user_id: true, name: true, email: true } },
        to_user: { select: { user_id: true, name: true, email: true } }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch moderation messages.' });
  }
};

// Review a message (admin only)
exports.reviewMessage = async (req, res) => {
  try {
    const message = await prisma.message.update({
      where: { message_id: Number(req.params.id) },
      data: { reviewed: true, flagged: false }
    });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to review message.' });
  }
};

// Delete a message (admin only)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await prisma.message.findUnique({
      where: { message_id: Number(req.params.id) }
    });
    if (!message) return res.status(404).json({ error: 'Message not found.' });
    await prisma.message.delete({
      where: { message_id: Number(req.params.id) }
    });
    res.json({ message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message.' });
  }
}; 