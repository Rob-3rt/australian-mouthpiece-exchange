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
    // Only log errors or key actions, not full request/response or user objects
    // Add user_id filter
    if (user_id === 'me' && req.user && req.user.userId) {
      filters.user_id = req.user.userId;
      // Don't filter by status for "my listings" - show all statuses
    } else if (user_id && !isNaN(Number(user_id))) {
      filters.user_id = Number(user_id);
      // Don't filter by status for specific user listings - show all statuses
    } else {
      // Only show active listings for public browsing
      filters.status = 'active';
    }
    
    // Get available models, brands, and instrument types for autocomplete (excluding the current filters)
    const modelFilters = { ...filters };
    delete modelFilters.model; // Remove model filter to get all available models
    delete modelFilters.brand; // Remove brand filter to get all available brands
    delete modelFilters.instrument_type; // Remove instrument filter to get all available instruments
    // For autocomplete, only show models, brands, and instruments from active listings
    if (!user_id || user_id === 'me') {
      modelFilters.status = 'active';
    }
    const availableModels = await prisma.listing.findMany({
      where: modelFilters,
      select: { model: true },
      distinct: ['model'],
      orderBy: { model: 'asc' }
    });
    
    const availableBrands = await prisma.listing.findMany({
      where: modelFilters,
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' }
    });
    
    const availableInstrumentTypes = await prisma.listing.findMany({
      where: modelFilters,
      select: { instrument_type: true },
      distinct: ['instrument_type'],
      orderBy: { instrument_type: 'asc' }
    });
    
    // Add pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24; // Default 24 listings per page
    const skip = (page - 1) * limit;
    
    const listings = await prisma.listing.findMany({
      where: filters,
      include: {
        user: { select: { user_id: true, name: true, nickname: true, average_rating: true, rating_count: true, location_state: true, location_postcode: true, paypal_link: true } }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: skip
    });
    
    // Get total count for pagination
    const totalCount = await prisma.listing.count({ where: filters });
    // Add effective PayPal link to each listing
    const listingsWithPaypal = listings.map(listing => ({
      ...listing,
      paypal_link_effective: listing.paypal_link_override || listing.user.paypal_link || null
    }));
    
    // Return both listings and available models/brands/instruments with pagination info
    res.json({
      listings: listingsWithPaypal,
      availableModels: availableModels.map(item => item.model),
      availableBrands: availableBrands.map(item => item.brand),
      availableInstrumentTypes: availableInstrumentTypes.map(item => item.instrument_type),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error('Error in getAllListings:', err);
    res.status(500).json({ error: 'Failed to fetch listings.' });
  }
};

// Create a new listing
exports.createListing = async (req, res) => {
  console.log('DEBUG: POST /api/listings hit');
  console.log('DEBUG: Incoming body (excluding photos):', {
    ...req.body,
    photos: req.body.photos ? `[${Array.isArray(req.body.photos) ? req.body.photos.length : 'not array'}]` : undefined
  });
  try {
    // Debug log incoming data (exclude photos/images)
    const { instrument_type, brand, model, condition, price, description, open_to_swap, open_to_loan, paypal_link_override, photos } = req.body;
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

    // Fix boolean conversion for open_to_loan
    let openToLoanBool = false;
    if (typeof open_to_loan === 'string') {
      openToLoanBool = open_to_loan.toLowerCase() === 'true';
    } else {
      openToLoanBool = !!open_to_loan;
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
        open_to_loan: openToLoanBool,
        status: 'active',
        paypal_link_override: validatedPaypal,
      },
    });
    res.status(201).json(listing);
  } catch (err) {
    console.error('Error in createListing:', err);
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
    console.log('DEBUG: PUT /api/listings/:id hit');
    console.log('DEBUG: Incoming body (excluding photos):', {
      ...req.body,
      photos: req.body.photos ? `[${Array.isArray(req.body.photos) ? req.body.photos.length : 'not array'}]` : undefined
    });
    const { instrument_type, brand, model, condition, price, description, photos, open_to_swap, open_to_loan, status, paypal_link_override } = req.body;
    // Validate required fields
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
    // Fix boolean conversion for open_to_loan
    let openToLoanBool = false;
    if (typeof open_to_loan === 'string') {
      openToLoanBool = open_to_loan.toLowerCase() === 'true';
    } else {
      openToLoanBool = !!open_to_loan;
    }
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
    try {
      const updated = await prisma.listing.update({
        where: { listing_id: listing.listing_id },
        data: {
          instrument_type,
          brand,
          model,
          condition,
          price: price ? parseFloat(price) : undefined,
          description,
          photos: photos || [],
          open_to_swap: openToSwapBool,
          open_to_loan: openToLoanBool,
          status,
          paypal_link_override: validatedPaypal
        },
      });
      res.json(updated);
    } catch (err) {
      console.error('Error in updateListing:', err);
      res.status(500).json({ error: 'Failed to update listing.', details: err.message });
    }
  } catch (err) {
    console.error('Error in updateListing (outer):', err);
    res.status(500).json({ error: 'Failed to update listing.', details: err.message });
  }
};

// Delete a listing
exports.deleteListing = async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { listing_id: Number(req.params.id) } });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    if (listing.user_id !== req.user.userId) return res.status(403).json({ error: 'Not authorized.' });
    // Delete all related loans first
    await prisma.loan.deleteMany({ where: { listing_id: listing.listing_id } });
    await prisma.listing.delete({ where: { listing_id: listing.listing_id } });
    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    console.error('Error deleting listing:', {
      error: err,
      listingId: req.params.id,
      user: req.user,
      stack: err?.stack
    });
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