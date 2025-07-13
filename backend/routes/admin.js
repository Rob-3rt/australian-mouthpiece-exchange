const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const prisma = new PrismaClient();

// Apply admin middleware to all routes
router.use(auth, admin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        email: true,
        name: true,
        nickname: true,
        location_state: true,
        location_postcode: true,
        email_verified: true,
        is_admin: true,
        status: true,
        join_date: true,
        average_rating: true,
        rating_count: true
      },
      orderBy: { join_date: 'desc' }
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Get single user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(req.params.id) },
      select: {
        user_id: true,
        email: true,
        name: true,
        nickname: true,
        location_state: true,
        location_postcode: true,
        email_verified: true,
        is_admin: true,
        status: true,
        join_date: true,
        average_rating: true,
        rating_count: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { name, nickname, location_state, location_postcode, is_admin, status } = req.body;
    
    const user = await prisma.user.update({
      where: { user_id: parseInt(req.params.id) },
      data: {
        name,
        nickname,
        location_state,
        location_postcode,
        is_admin: is_admin || false,
        status: status || 'active'
      },
      select: {
        user_id: true,
        email: true,
        name: true,
        nickname: true,
        location_state: true,
        location_postcode: true,
        email_verified: true,
        is_admin: true,
        status: true,
        join_date: true
      }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// Toggle email verification
router.patch('/users/:id/verify-email', async (req, res) => {
  try {
    const { email_verified } = req.body;
    
    const user = await prisma.user.update({
      where: { user_id: parseInt(req.params.id) },
      data: { email_verified },
      select: {
        user_id: true,
        email: true,
        email_verified: true
      }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error updating email verification:', error);
    res.status(500).json({ error: 'Failed to update email verification.' });
  }
});

// Toggle admin status
router.patch('/users/:id/admin', async (req, res) => {
  try {
    const { is_admin } = req.body;
    const userId = parseInt(req.params.id);
    
    // Don't allow admin to remove their own admin status
    if (userId === req.user.userId && !is_admin) {
      return res.status(400).json({ error: 'Cannot remove your own admin status.' });
    }
    
    const user = await prisma.user.update({
      where: { user_id: userId },
      data: { is_admin },
      select: {
        user_id: true,
        email: true,
        is_admin: true
      }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error updating admin status:', error);
    res.status(500).json({ error: 'Failed to update admin status.' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log(`Attempting to delete user with ID: ${userId}`);
    
    // Don't allow admin to delete themselves
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account.' });
    }
    
    // Check if user exists first
    const userToDelete = await prisma.user.findUnique({
      where: { user_id: userId }
    });
    
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    console.log(`Deleting related data for user: ${userToDelete.email}`);
    
    // Delete user's listings, messages, and ratings first
    const listingsDeleted = await prisma.listing.deleteMany({ where: { user_id: userId } });
    console.log(`Deleted ${listingsDeleted.count} listings`);
    
    const messagesDeleted = await prisma.message.deleteMany({ 
      where: { 
        OR: [
          { from_user_id: userId },
          { to_user_id: userId }
        ]
      } 
    });
    console.log(`Deleted ${messagesDeleted.count} messages`);
    
    const ratingsFromDeleted = await prisma.peerRating.deleteMany({ where: { from_user_id: userId } });
    const ratingsToDeleted = await prisma.peerRating.deleteMany({ where: { to_user_id: userId } });
    console.log(`Deleted ${ratingsFromDeleted.count + ratingsToDeleted.count} ratings`);
    
    const flagsDeleted = await prisma.flaggedContent.deleteMany({ where: { reporter_id: userId } });
    console.log(`Deleted ${flagsDeleted.count} flagged content`);
    
    // Finally delete the user
    await prisma.user.delete({ where: { user_id: userId } });
    console.log(`Successfully deleted user: ${userToDelete.email}`);
    
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user.', details: error.message });
  }
});

// Temporary endpoint to delete unverified users
router.delete('/unverified-users', async (req, res) => {
  try {
    console.log('Deleting unverified users...');
    
    // First, let's see what unverified users exist
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        email_verified: false
      },
      select: {
        user_id: true,
        email: true,
        name: true,
        join_date: true
      }
    });
    
    console.log(`Found ${unverifiedUsers.length} unverified users to delete`);
    
    if (unverifiedUsers.length === 0) {
      return res.json({ message: 'No unverified users found.' });
    }
    
    // Delete all unverified users
    const result = await prisma.user.deleteMany({
      where: {
        email_verified: false
      }
    });
    
    console.log(`Successfully deleted ${result.count} unverified users`);
    
    res.json({ 
      message: `Successfully deleted ${result.count} unverified users.`,
      deletedUsers: unverifiedUsers
    });
    
  } catch (error) {
    console.error('Error deleting unverified users:', error);
    res.status(500).json({ error: 'Failed to delete unverified users.' });
  }
});

module.exports = router; 