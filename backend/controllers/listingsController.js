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

// Get all listings (with optional filters in query)
exports.getAllListings = async (req, res) => {
  console.log('getAllListings called with URL:', req.url);
  console.log('getAllListings called with method:', req.method);
  console.log('getAllListings called with headers:', req.headers);
  try {
    const filters = {};
    const { instrument_type, brand, model, location_state, location_postcode, condition, price_min, price_max, open_to_swap, user_id } = req.query;
    if (instrument_type) filters.instrument_type = instrument_type;
    if (Array.isArray(brand) && brand.length > 0) {
      filters.brand = { in: brand };
    } else if (brand) {
      filters.brand = brand;
    }
    if (model) filters.model = { contains: model, mode: 'insensitive' };
    if (Array.isArray(location_state) && location_state.length > 0) {
      filters.user = { location_state: { in: location_state } };
    } else if (location_state) {
      filters.user = { location_state };
    }
    if (location_postcode) filters.location_postcode = location_postcode;
    if (Array.isArray(condition) && condition.length > 0) {
      filters.condition = { in: condition };
    } else if (condition) {
      filters.condition = condition;
    }
    if (open_to_swap !== undefined) filters.open_to_swap = open_to_swap === 'true';
    if (price_min || price_max) filters.price = {};
    if (price_min) filters.price.gte = parseFloat(price_min);
    if (price_max) filters.price.lte = parseFloat(price_max);
    console.log('Request user_id:', user_id);
    console.log('Request user:', req.user);
    // Add user_id filter
    if (user_id === 'me' && req.user && req.user.userId) {
      filters.user_id = req.user.userId;
      console.log('Using user_id from req.user.userId:', req.user.userId);
      // Don't filter by status for "my listings" - show all statuses
    } else if (user_id && !isNaN(Number(user_id))) {
      filters.user_id = Number(user_id);
      console.log('Using user_id from query param:', Number(user_id));
      // Don't filter by status for specific user listings - show all statuses
    } else {
      // Only show active listings for public browsing
      filters.status = 'active';
      console.log('No user_id filter, showing only active listings');
    }
    
    // Get available models for autocomplete (excluding the current model filter)
    const modelFilters = { ...filters };
    delete modelFilters.model; // Remove model filter to get all available models
    // For autocomplete, only show models from active listings
    if (!user_id || user_id === 'me') {
      modelFilters.status = 'active';
    }
    const availableModels = await prisma.listing.findMany({
      where: modelFilters,
      select: { model: true },
      distinct: ['model'],
      orderBy: { model: 'asc' }
    });
    
    console.log('Filters being applied:', filters);
    const listings = await prisma.listing.findMany({
      where: filters,
      include: {
        user: { select: { user_id: true, name: true, nickname: true, average_rating: true, rating_count: true, location_state: true, location_postcode: true, paypal_link: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    console.log('Found listings:', listings.length);
    console.log('Listing statuses:', listings.map(l => ({ id: l.listing_id, status: l.status })));
    // Add effective PayPal link to each listing
    const listingsWithPaypal = listings.map(listing => ({
      ...listing,
      paypal_link_effective: listing.paypal_link_override || listing.user.paypal_link || null
    }));
    
    // Return both listings and available models
    res.json({
      listings: listingsWithPaypal,
      availableModels: availableModels.map(item => item.model)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings.' });
  }
};

// Create a new listing
exports.createListing = async (req, res) => {
  try {
    // Debug log incoming data
    console.log('Incoming listing payload:', req.body);
    const { instrument_type, brand, model, condition, price, description, photos, open_to_swap, paypal_link_override } = req.body;
    console.log('instrument_type:', instrument_type);
    console.log('brand:', brand);
    console.log('model:', model);
    console.log('condition:', condition);
    console.log('price:', price);
    console.log('description:', description);
    // Enhanced required fields check with detailed logging
    const missingFields = [];
    if (!instrument_type) missingFields.push('instrument_type');
    if (!brand) missingFields.push('brand');
    if (!model) missingFields.push('model');
    if (!condition) missingFields.push('condition');
    if (!price) missingFields.push('price');
    if (!description) missingFields.push('description');
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ error: 'Missing required fields.', missingFields });
    }
    // Fix boolean conversion for open_to_swap
    let openToSwapBool = false;
    if (typeof open_to_swap === 'string') {
      openToSwapBool = open_to_swap.toLowerCase() === 'true';
    } else {
      openToSwapBool = !!open_to_swap;
    }
    let validatedPaypal = null;
    if (paypal_link_override) {
      if (PAYPAL_ME_REGEX.test(paypal_link_override)) {
        // Normalize PayPal.Me links to include https:// if missing
        if (paypal_link_override.startsWith('paypal.me/')) {
          validatedPaypal = 'https://' + paypal_link_override;
        } else if (paypal_link_override.startsWith('www.paypal.me/')) {
          validatedPaypal = 'https://' + paypal_link_override;
        } else {
          validatedPaypal = paypal_link_override;
        }
      } else if (EMAIL_REGEX.test(paypal_link_override)) {
        if (isDisposableEmail(paypal_link_override)) {
          return res.status(400).json({ error: 'Disposable email addresses are not allowed for PayPal.' });
        }
        validatedPaypal = paypal_link_override;
      } else {
        return res.status(400).json({ error: 'PayPal link must be a valid PayPal.Me URL or email address.' });
      }
    }
    const listing = await prisma.listing.create({
      data: {
        user_id: req.user.userId,
        instrument_type,
        brand,
        model,
        condition,
        price: parseFloat(price),
        description,
        photos: photos || [],
        open_to_swap: openToSwapBool,
        status: 'active',
        paypal_link_override: validatedPaypal,
      },
    });
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create listing.' });
  }
};

// Get a single listing by ID
exports.getListing = async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { listing_id: Number(req.params.id) },
      include: {
        user: { select: { user_id: true, name: true, nickname: true, average_rating: true, rating_count: true, location_state: true, location_postcode: true, paypal_link: true } }
      }
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    // Add effective PayPal link
    const listingWithPaypal = {
      ...listing,
      paypal_link_effective: listing.paypal_link_override || listing.user.paypal_link || null
    };
    res.json(listingWithPaypal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listing.' });
  }
};

// Update a listing
exports.updateListing = async (req, res) => {
  try {
    const { instrument_type, brand, model, condition, price, description, photos, open_to_swap, status, paypal_link_override } = req.body;
    const listing = await prisma.listing.findUnique({ where: { listing_id: Number(req.params.id) } });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    if (listing.user_id !== req.user.userId) return res.status(403).json({ error: 'Not authorized.' });
    let validatedPaypal = null;
    if (paypal_link_override) {
      if (PAYPAL_ME_REGEX.test(paypal_link_override)) {
        // Normalize PayPal.Me links to include https:// if missing
        if (paypal_link_override.startsWith('paypal.me/')) {
          validatedPaypal = 'https://' + paypal_link_override;
        } else if (paypal_link_override.startsWith('www.paypal.me/')) {
          validatedPaypal = 'https://' + paypal_link_override;
        } else {
          validatedPaypal = paypal_link_override;
        }
      } else if (EMAIL_REGEX.test(paypal_link_override)) {
        if (isDisposableEmail(paypal_link_override)) {
          return res.status(400).json({ error: 'Disposable email addresses are not allowed for PayPal.' });
        }
        validatedPaypal = paypal_link_override;
      } else {
        return res.status(400).json({ error: 'PayPal link must be a valid PayPal.Me URL or email address.' });
      }
    }
    const updated = await prisma.listing.update({
      where: { listing_id: listing.listing_id },
      data: {
        instrument_type, brand, model, condition, price: price ? parseFloat(price) : undefined, description, photos, open_to_swap, status, paypal_link_override: validatedPaypal
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update listing.' });
  }
};

// Delete a listing
exports.deleteListing = async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { listing_id: Number(req.params.id) } });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    if (listing.user_id !== req.user.userId) return res.status(403).json({ error: 'Not authorized.' });
    await prisma.listing.delete({ where: { listing_id: listing.listing_id } });
    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete listing.' });
  }
};

// Pause/unpause a listing
exports.pauseListing = async (req, res) => {
  try {
    console.log('Pause request for listing:', req.params.id);
    const listing = await prisma.listing.findUnique({ where: { listing_id: Number(req.params.id) } });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    if (listing.user_id !== req.user.userId) return res.status(403).json({ error: 'Not authorized.' });
    
    console.log('Current listing status:', listing.status);
    const newStatus = listing.status === 'paused' ? 'active' : 'paused';
    console.log('New status will be:', newStatus);
    
    const updated = await prisma.listing.update({
      where: { listing_id: listing.listing_id },
      data: { status: newStatus },
    });
    console.log('Updated listing:', updated);
    res.json(updated);
  } catch (err) {
    console.error('Pause error:', err);
    res.status(500).json({ error: 'Failed to pause/unpause listing.' });
  }
}; 