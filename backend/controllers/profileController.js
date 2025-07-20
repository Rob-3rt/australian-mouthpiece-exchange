const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const PAYPAL_ME_REGEX = /^(https?:\/\/)?(www\.)?paypal\.me\/[\w\-]+(\/?.*)?$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Allowed values for validation
const ALLOWED_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com', 'yopmail.com', 'trashmail.com', 'fakeinbox.com', 'getnada.com', 'dispostable.com', 'maildrop.cc', 'mintemail.com', 'mytemp.email', 'throwawaymail.com', 'mailnesia.com', 'spamgourmet.com', 'sharklasers.com', 'spam4.me', 'mailcatch.com', 'inboxbear.com', 'spambog.com', 'spambox.us', 'temp-mail.org', 'temp-mail.ru', 'tempmail.net', 'tempmailo.com', 'emailondeck.com', 'moakt.com', 'anonbox.net', 'mail-temp.com', 'tempail.com', 'emailtemporario.com.br', 'mail7.io', 'disposablemail.com', 'dropmail.me', 'easytrashmail.com', 'eyepaste.com', 'fakemailgenerator.com', 'mailcatch.com', 'maildrop.cc', 'mailnesia.com', 'mailnull.com', 'meltmail.com', 'nowmymail.com', 'objectmail.com', 'onewaymail.com', 'proxymail.eu', 'sharklasers.com', 'spamavert.com', 'spamfree24.com', 'spamslicer.com', 'spamspot.com', 'tempemail.net', 'tempinbox.com', 'trashmail.com', 'yopmail.com'
];

function isDisposableEmail(email) {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
}

// Profile validation function
const validateProfileFields = (data) => {
  const errors = [];

  // Name validation
  if (data.name !== undefined && data.name !== null) {
    if (typeof data.name !== 'string') {
      errors.push('Name must be a string.');
    } else if (data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long.');
    } else if (data.name.length > 100) {
      errors.push('Name must be 100 characters or less.');
    }
  }

  // Nickname validation
  if (data.nickname !== undefined && data.nickname !== null) {
    if (typeof data.nickname !== 'string') {
      errors.push('Nickname must be a string.');
    } else if (data.nickname.trim().length > 50) {
      errors.push('Nickname must be 50 characters or less.');
    }
  }

  // Location state validation
  if (data.location_state !== undefined && data.location_state !== null) {
    if (typeof data.location_state !== 'string') {
      errors.push('Location state must be a string.');
    } else if (!ALLOWED_STATES.includes(data.location_state)) {
      errors.push(`Invalid state. Must be one of: ${ALLOWED_STATES.join(', ')}`);
    }
  }

  // Location postcode validation
  if (data.location_postcode !== undefined && data.location_postcode !== null) {
    if (typeof data.location_postcode !== 'string') {
      errors.push('Location postcode must be a string.');
    } else if (!/^\d{4}$/.test(data.location_postcode)) {
      errors.push('Postcode must be exactly 4 digits.');
    }
  }

  // PayPal link validation
  if (data.paypal_link !== undefined && data.paypal_link !== null && data.paypal_link !== '') {
    if (typeof data.paypal_link !== 'string') {
      errors.push('PayPal link must be a string.');
    } else if (!PAYPAL_ME_REGEX.test(data.paypal_link) && !EMAIL_REGEX.test(data.paypal_link)) {
      errors.push('PayPal link must be a valid PayPal.Me URL or email address.');
    } else if (EMAIL_REGEX.test(data.paypal_link) && isDisposableEmail(data.paypal_link)) {
      errors.push('Disposable email addresses are not allowed for PayPal.');
    }
  }

  // Email notifications validation
  if (data.email_notifications !== undefined && data.email_notifications !== null) {
    if (typeof data.email_notifications !== 'boolean') {
      errors.push('Email notifications must be a boolean.');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
};

// Get own profile
exports.getMyProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      console.error('No userId in req.user:', req.user);
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.userId },
      select: {
        user_id: true, name: true, nickname: true, email: true, location_state: true, location_postcode: true, average_rating: true, rating_count: true, paypal_link: true, join_date: true, status: true,
        email_notifications: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('getMyProfile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

// Update own profile
exports.updateMyProfile = async (req, res) => {
  try {
    // Comprehensive field validation
    const fieldValidation = validateProfileFields(req.body);
    if (!fieldValidation.valid) {
      console.error('Profile validation failed:', fieldValidation.errors);
      return res.status(400).json({ 
        error: 'Validation failed.', 
        details: fieldValidation.errors 
      });
    }

    const { name, nickname, location_state, location_postcode, paypal_link, email_notifications } = req.body;
    let validatedPaypal = null;
    if (paypal_link) {
      if (PAYPAL_ME_REGEX.test(paypal_link)) {
        // Normalize PayPal.Me links to include https:// if missing
        if (paypal_link.startsWith('paypal.me/')) {
          validatedPaypal = 'https://' + paypal_link;
        } else if (paypal_link.startsWith('www.paypal.me/')) {
          validatedPaypal = 'https://' + paypal_link;
        } else {
          validatedPaypal = paypal_link;
        }
      } else if (EMAIL_REGEX.test(paypal_link)) {
        if (isDisposableEmail(paypal_link)) {
          return res.status(400).json({ error: 'Disposable email addresses are not allowed for PayPal.' });
        }
        validatedPaypal = paypal_link;
      } else {
        return res.status(400).json({ error: 'PayPal link must be a valid PayPal.Me URL or email address.' });
      }
    }
    const user = await prisma.user.update({
      where: { user_id: req.user.userId },
      data: { name, nickname, location_state, location_postcode, paypal_link: validatedPaypal, ...(email_notifications !== undefined ? { email_notifications } : {}) },
      select: {
        user_id: true, name: true, nickname: true, email: true, location_state: true, location_postcode: true, average_rating: true, rating_count: true, paypal_link: true, join_date: true, status: true,
        email_notifications: true
      }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// Get public profile by userId
exports.getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: Number(req.params.userId) },
      select: {
        user_id: true, name: true, nickname: true, average_rating: true, rating_count: true, join_date: true, location_state: true, location_postcode: true, paypal_link: true, status: true
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
}; 