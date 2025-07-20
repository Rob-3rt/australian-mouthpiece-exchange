const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new rating
exports.createRating = async (req, res) => {
  try {
    const { to_user_id, transaction_id, stars, comment } = req.body;
    if (!to_user_id || !transaction_id || !stars || stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Invalid rating data.' });
    }
    // Check if user already rated this peer for this transaction
    const existing = await prisma.peerRating.findFirst({
      where: {
        from_user_id: req.user.userId,
        to_user_id: Number(to_user_id),
        transaction_id: Number(transaction_id)
      }
    });
    if (existing) {
      return res.status(409).json({ error: 'You have already rated this user for this transaction.' });
    }
    const rating = await prisma.peerRating.create({
      data: {
        from_user_id: req.user.userId,
        to_user_id: Number(to_user_id),
        transaction_id: Number(transaction_id),
        stars,
        comment,
        published: false,
        reviewed: false
      }
    });
    res.status(201).json(rating);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create rating.' });
  }
};

// Get ratings for a specific user
exports.getUserRatings = async (req, res) => {
  try {
    const ratings = await prisma.peerRating.findMany({
      where: {
        to_user_id: Number(req.params.userId),
        published: true
      },
      include: {
        from_user: { select: { user_id: true, name: true, nickname: true } }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ratings.' });
  }
};

// Get ratings for moderation (admin only)
exports.getModerationRatings = async (req, res) => {
  try {
    // TODO: Add admin check here
    const ratings = await prisma.peerRating.findMany({
      where: {
        OR: [
          { published: false },
          { reviewed: false }
        ]
      },
      include: {
        from_user: { select: { user_id: true, name: true, email: true } },
        to_user: { select: { user_id: true, name: true, email: true } }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch moderation ratings.' });
  }
};

// Publish a rating (admin only)
exports.publishRating = async (req, res) => {
  try {
    // TODO: Add admin check here
    const rating = await prisma.peerRating.update({
      where: { rating_id: Number(req.params.id) },
      data: { published: true, reviewed: true }
    });
    // Update user's average rating
    await updateUserAverageRating(rating.to_user_id);
    res.json(rating);
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish rating.' });
  }
};

// Delete a rating (admin only)
exports.deleteRating = async (req, res) => {
  try {
    // TODO: Add admin check here
    const rating = await prisma.peerRating.findUnique({
      where: { rating_id: Number(req.params.id) }
    });
    if (!rating) return res.status(404).json({ error: 'Rating not found.' });
    await prisma.peerRating.delete({
      where: { rating_id: Number(req.params.id) }
    });
    // Update user's average rating
    await updateUserAverageRating(rating.to_user_id);
    res.json({ message: 'Rating deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete rating.' });
  }
};

// Helper function to update user's average rating
async function updateUserAverageRating(userId) {
  const ratings = await prisma.peerRating.findMany({
    where: {
      to_user_id: userId,
      published: true
    }
  });
  const totalStars = ratings.reduce((sum, r) => sum + r.stars, 0);
  const averageRating = ratings.length > 0 ? totalStars / ratings.length : 0;
  await prisma.user.update({
    where: { user_id: userId },
    data: {
      average_rating: averageRating,
      rating_count: ratings.length
    }
  });
} 