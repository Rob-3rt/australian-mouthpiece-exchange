const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

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
        created_at: true
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