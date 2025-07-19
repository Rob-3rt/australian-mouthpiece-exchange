const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

// Helper: send verification email
async function sendVerificationEmail(user, req) {
  const token = jwt.sign({ userId: user.user_id }, config.jwtSecret, { expiresIn: '1d' });
  const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}`;
  
  // Try to use Resend if available, fallback to nodemailer
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
      <p>Welcome to The Australian Mouthpiece Exchange! Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}" 
         style="background-color: #4a1d3f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
        Verify Email
      </a>
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        This link will expire in 24 hours.
      </p>
      <p style="color: #666; font-size: 14px;">
        If you didn't create an account, please ignore this email.
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
}

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, location_state, location_postcode, nickname } = req.body;
    
    // Debug: log the received data
    console.log('Registration request body:', req.body);
    console.log('Extracted fields:', { email, password, first_name, last_name, location_state, location_postcode, nickname });
    
    if (!email || !password || !first_name || !last_name || !location_state || !location_postcode) {
      console.log('Missing fields:', { 
        email: !!email, 
        password: !!password, 
        first_name: !!first_name, 
        last_name: !!last_name, 
        location_state: !!location_state, 
        location_postcode: !!location_postcode 
      });
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    
    // Combine first and last name
    const name = `${first_name} ${last_name}`.trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        name,
        location_state,
        location_postcode,
        nickname,
        email_verified: false, // Require email verification
        status: 'active',
      },
    });
    
    // Try to send verification email, but don't fail if email config is missing
    try {
      await sendVerificationEmail(user, req);
      console.log('Verification email sent successfully to:', user.email);
    } catch (emailError) {
      console.log('Email verification skipped (email not configured):', emailError.message);
      // For development/testing, log the verification URL
      const token = jwt.sign({ userId: user.user_id }, config.jwtSecret, { expiresIn: '1d' });
      const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}`;
      console.log('Verification URL for testing:', verifyUrl);
    }
    
    res.status(201).json({ 
      message: 'Registration successful! Please check your email to verify your account before logging in.' 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password.' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in. Check your inbox for a verification link.' });
    }
    const token = jwt.sign({ userId: user.user_id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
    res.json({ 
      token, 
      user: { 
        user_id: user.user_id, 
        email: user.email, 
        name: user.name, 
        nickname: user.nickname, 
        location_state: user.location_state, 
        location_postcode: user.location_postcode,
        is_admin: user.is_admin
      } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
};

// Email verification endpoint
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Missing token.' });
    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }
    const user = await prisma.user.findUnique({ where: { user_id: payload.userId } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.email_verified) return res.json({ message: 'Email already verified.' });
    await prisma.user.update({ where: { user_id: user.user_id }, data: { email_verified: true } });
    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Email verification failed.' });
  }
};

// Helper: send password reset email
async function sendPasswordResetEmail(user, resetToken, req) {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
  
  // Try to use Resend if available, fallback to nodemailer
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
      <h2 style="color: #4a1d3f;">Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>You requested a password reset for your The Australian Mouthpiece Exchange account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" 
         style="background-color: #4a1d3f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
        Reset Password
      </a>
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        This link will expire in 1 hour.
      </p>
      <p style="color: #666; font-size: 14px;">
        If you didn't request this reset, please ignore this email.
      </p>
      <p style="color: #666; font-size: 14px;">
        Thanks,<br>The Australian Mouthpiece Exchange Team
      </p>
    </div>
  `;

  if (resend && config.resendApiKey) {
    await resend.emails.send({
      from: config.emailFrom,
      to: user.email,
      subject: 'Password Reset Request - The Australian Mouthpiece Exchange',
      html: html,
    });
  } else {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      auth: { user: config.smtpUser, pass: config.smtpPass },
    });
    await transporter.sendMail({
      from: config.emailFrom,
      to: user.email,
      subject: 'Password Reset Request - The Australian Mouthpiece Exchange',
      html: html,
    });
  }
}

// Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }
    
    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user.user_id, type: 'password_reset' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    
    // Try to send reset email, but don't fail if email config is missing
    try {
      await sendPasswordResetEmail(user, resetToken, req);
      console.log('Password reset email sent successfully to:', user.email);
      res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError.message);
      console.error('Email config check:', {
        smtpHost: config.smtpHost ? 'Set' : 'Not set',
        smtpUser: config.smtpUser ? 'Set' : 'Not set',
        smtpPass: config.smtpPass ? 'Set' : 'Not set',
        emailFrom: config.emailFrom ? 'Set' : 'Not set'
      });
      
      // For development, log the reset token so you can test the flow
      console.log('Password reset token for testing:', resetToken);
      console.log('Reset URL for testing:', `${req.protocol}://${req.get('host').replace('4000', '5173')}/reset-password?token=${resetToken}`);
      
      // Don't return an error, just log it and continue
      res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Password reset request failed.' });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    
    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }
    
    if (payload.type !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid token type.' });
    }
    
    const user = await prisma.user.findUnique({ where: { user_id: payload.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10);
    
    // Update user's password
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { password_hash }
    });
    
    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Password reset failed.' });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.userId },
      select: {
        user_id: true,
        email: true,
        name: true,
        nickname: true,
        location_state: true,
        location_postcode: true,
        is_admin: true,
        email_verified: true,
        status: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
}; 