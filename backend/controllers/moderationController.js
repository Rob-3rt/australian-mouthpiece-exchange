const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Flag listing
exports.flagContent = async (req, res) => {
  try {
    const { content_id, reason } = req.body;
    if (!content_id || !reason) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    
    // Check if listing exists
    const listing = await prisma.listing.findUnique({ where: { listing_id: Number(content_id) } });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    
    // Check if user already flagged this listing
    const existing = await prisma.flaggedContent.findFirst({
      where: {
        content_type: 'listing',
        content_id: Number(content_id),
        reporter_id: req.user.userId
      }
    });
    if (existing) {
      return res.status(409).json({ error: 'You have already flagged this listing.' });
    }
    
    const flag = await prisma.flaggedContent.create({
      data: {
        content_type: 'listing',
        content_id: Number(content_id),
        reporter_id: req.user.userId,
        reason,
        status: 'pending'
      }
    });
    res.status(201).json(flag);
  } catch (err) {
    res.status(500).json({ error: 'Failed to flag listing.' });
  }
};

// Get all flagged listings (admin only)
exports.getAllFlags = async (req, res) => {
  try {
    // TODO: Add admin check here
    const flags = await prisma.flaggedContent.findMany({
      where: {
        content_type: 'listing'
      },
      include: {
        reporter: { select: { user_id: true, name: true, email: true } }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(flags);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flagged listings.' });
  }
};

// Update flag status (admin only)
exports.updateFlagStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const flag = await prisma.flaggedContent.update({
      where: { flag_id: Number(req.params.id) },
      data: { status, notes }
    });
    res.json(flag);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update flag status.' });
  }
};

// Delete flag (admin only)
exports.deleteFlag = async (req, res) => {
  try {
    await prisma.flaggedContent.delete({
      where: { flag_id: Number(req.params.id) }
    });
    res.json({ message: 'Flag deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete flag.' });
  }
};

// Get moderation dashboard (admin only)
exports.getModerationDashboard = async (req, res) => {
  try {
    // TODO: Add admin check here
    const pendingFlags = await prisma.flaggedContent.count({ 
      where: { 
        status: 'pending',
        content_type: 'listing'
      } 
    });
    res.json({
      pendingFlags
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch moderation dashboard.' });
  }
}; 