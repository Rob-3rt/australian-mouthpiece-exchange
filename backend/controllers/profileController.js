const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const PAYPAL_ME_REGEX = /^(https?:\/\/)?(www\.)?paypal\.me\/[\w\-]+(\/?.*)?$/i;
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com', 'yopmail.com', 'trashmail.com', 'fakeinbox.com', 'getnada.com', 'dispostable.com', 'maildrop.cc', 'mintemail.com', 'mytemp.email', 'throwawaymail.com', 'mailnesia.com', 'spamgourmet.com', 'sharklasers.com', 'spam4.me', 'mailcatch.com', 'inboxbear.com', 'spambog.com', 'spambox.us', 'temp-mail.org', 'temp-mail.ru', 'tempmail.net', 'tempmailo.com', 'emailondeck.com', 'moakt.com', 'anonbox.net', 'mail-temp.com', 'tempail.com', 'emailtemporario.com.br', 'mail7.io', 'disposablemail.com', 'dropmail.me', 'easytrashmail.com', 'eyepaste.com', 'fakemailgenerator.com', 'mailcatch.com', 'maildrop.cc', 'mailnesia.com', 'mailnull.com', 'meltmail.com', 'nowmymail.com', 'objectmail.com', 'onewaymail.com', 'proxymail.eu', 'sharklasers.com', 'spamavert.com', 'spamfree24.com', 'spamslicer.com', 'spamspot.com', 'tempemail.net', 'tempinbox.com', 'trashmail.com', 'yopmail.com'
];

function isDisposableEmail(email) {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
}

// Get own profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.userId },
      select: {
        user_id: true, name: true, nickname: true, email: true, location_state: true, location_postcode: true, average_rating: true, rating_count: true, paypal_link: true, join_date: true, status: true
      }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

// Update own profile
exports.updateMyProfile = async (req, res) => {
  try {
    const { name, nickname, location_state, location_postcode, paypal_link } = req.body;
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
      data: { name, nickname, location_state, location_postcode, paypal_link: validatedPaypal },
      select: {
        user_id: true, name: true, nickname: true, email: true, location_state: true, location_postcode: true, average_rating: true, rating_count: true, paypal_link: true, join_date: true, status: true
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