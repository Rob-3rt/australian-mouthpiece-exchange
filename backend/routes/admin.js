const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
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
    const force = req.query.force === 'true';
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

    // Check for active listings or loans
    const userListings = await prisma.listing.findMany({
      where: { user_id: userId },
      select: { listing_id: true }
    });
    const listingIds = userListings.map(l => l.listing_id);
    const activeListingsCount = userListings.length;
    const activeLoansCount = await prisma.loan.count({ where: { listing_id: { in: listingIds } } });

    if ((activeListingsCount > 0 || activeLoansCount > 0) && !force) {
      return res.status(200).json({
        warning: true,
        message: 'Warning: this user has active listings or loans - do you want to proceed?',
        activeListings: activeListingsCount,
        activeLoans: activeLoansCount
      });
    }

    console.log(`Deleting related data for user: ${userToDelete.email}`);

    // Delete all loans for the user's listings
    if (listingIds.length > 0) {
      const loansDeleted = await prisma.loan.deleteMany({ where: { listing_id: { in: listingIds } } });
      console.log(`Deleted ${loansDeleted.count} loans for user's listings`);
    }

    // Delete user's listings
    const listingsDeleted = await prisma.listing.deleteMany({ where: { user_id: userId } });
    console.log(`Deleted ${listingsDeleted.count} listings`);
    
    // Delete user's messages
    const messagesDeleted = await prisma.message.deleteMany({ 
      where: { 
        OR: [
          { from_user_id: userId },
          { to_user_id: userId }
        ]
      } 
    });
    console.log(`Deleted ${messagesDeleted.count} messages`);
    
    // Delete user's ratings
    const ratingsFromDeleted = await prisma.peerRating.deleteMany({ where: { from_user_id: userId } });
    const ratingsToDeleted = await prisma.peerRating.deleteMany({ where: { to_user_id: userId } });
    console.log(`Deleted ${ratingsFromDeleted.count + ratingsToDeleted.count} ratings`);
    
    // Delete user's flags
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

// Test email endpoint (admin only)
router.post('/test-email', async (req, res) => {
  try {
    const { to_email, test_type } = req.body;
    
    if (!to_email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const notificationService = require('../utils/notificationService');
    
    if (!notificationService.isEmailConfigured()) {
      return res.status(400).json({ 
        error: 'Email service not configured.',
        config: {
          smtpHost: process.env.SMTP_HOST ? 'Set' : 'Not set',
          smtpUser: process.env.SMTP_USER ? 'Set' : 'Not set',
          smtpPass: process.env.SMTP_PASS ? 'Set' : 'Not set',
          emailFrom: process.env.EMAIL_FROM ? 'Set' : 'Not set'
        }
      });
    }

    // Create test data
    const testRecipient = { name: 'Test User', email: to_email };
    const testSender = { name: 'Test Sender', nickname: 'TestSender', user_id: 1 };
    const testMessage = 'This is a test email from The Australian Mouthpiece Exchange.';
    const testListing = { brand: 'Test Brand', model: 'Test Model', listing_id: 1 };

    // Send test email
    const result = await notificationService.sendMessageNotification(
      testRecipient,
      testSender,
      testMessage,
      testListing
    );

    if (result) {
      res.json({ 
        success: true, 
        message: 'Test email sent successfully!',
        sentTo: to_email
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send test email.',
        sentTo: to_email
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      error: 'Test email failed.',
      details: error.message
    });
  }
});

// Resend verification email (admin only)
router.post('/users/:id/resend-verification', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log(`Attempting to resend verification email for user ID: ${userId}`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { user_id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    if (user.email_verified) {
      return res.status(400).json({ error: 'User email is already verified.' });
    }
    
    // Generate verification token
    const jwt = require('jsonwebtoken');
    const config = require('../config');
    const token = jwt.sign({ userId: user.user_id }, config.jwtSecret, { expiresIn: '1d' });
    const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}`;
    
    // Send verification email using Resend
    let resend = null;
    try {
      resend = require('resend');
      if (config.resendApiKey) {
        resend = new resend.Resend(config.resendApiKey);
      }
    } catch (error) {
      console.log('Resend not installed, using nodemailer');
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a1d3f;">Email Verification</h2>
        <p>Hi ${user.name},</p>
        <p>An administrator has requested to resend your email verification link.</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyUrl}" 
           style="background-color: #4a1d3f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Verify Email
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          This link will expire in 24 hours.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this verification, please ignore this email.
        </p>
      </div>
    `;

    if (resend && config.resendApiKey) {
      await resend.emails.send({
        from: config.emailFrom,
        to: user.email,
        subject: 'Verify your email - The Australian Mouthpiece Exchange',
        html: html,
      });
    } else {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        auth: { user: config.smtpUser, pass: config.smtpPass },
      });
      
      await transporter.sendMail({
        from: config.emailFrom,
        to: user.email,
        subject: 'Verify your email - The Australian Mouthpiece Exchange',
        html: html,
      });
    }
    
    console.log(`Verification email resent successfully to: ${user.email}`);
    res.json({ 
      success: true, 
      message: 'Verification email sent successfully!',
      sentTo: user.email
    });
    
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ 
      error: 'Failed to resend verification email.',
      details: error.message
    });
  }
});

module.exports = router; 