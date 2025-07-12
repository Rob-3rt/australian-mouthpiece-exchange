const nodemailer = require('nodemailer');
const config = require('../config');

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  auth: { user: config.smtpUser, pass: config.smtpPass },
});

// Send email notification for new message
async function sendMessageNotification(recipient, sender, message, listing = null) {
  try {
    const subject = `New message from ${sender.nickname || sender.name}`;
    const listingInfo = listing ? ` about ${listing.brand} ${listing.model}` : '';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1877f2;">New Message Received</h2>
        <p>Hi ${recipient.name},</p>
        <p>You have received a new message from <strong>${sender.nickname || sender.name}</strong>${listingInfo}.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-style: italic;">"${message}"</p>
        </div>
        <p>Click the link below to view and respond to this message:</p>
        <a href="${config.frontendUrl}/messages/${sender.user_id}${listing ? `?listing_id=${listing.listing_id}` : ''}" 
           style="background-color: #1877f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Message
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          You're receiving this email because you have a new message on The Australian Mouthpiece Exchange.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: config.emailFrom,
      to: recipient.email,
      subject: subject,
      html: html,
    });

    console.log(`Message notification email sent to ${recipient.email}`);
    return true;
  } catch (error) {
    console.error('Failed to send message notification email:', error);
    return false;
  }
}

// Check if email configuration is available
function isEmailConfigured() {
  return !!(config.smtpHost && config.smtpUser && config.smtpPass && config.emailFrom);
}

module.exports = {
  sendMessageNotification,
  isEmailConfigured,
}; 