const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mime = require('mime-types');
const ImageOptimizer = require('../utils/imageOptimizer');
const sharp = require('sharp');

const PAYPAL_ME_REGEX = /^(https?:\/\/)?(www\.)?paypal\.me\/[\w\-]+(\/?.*)?$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Allowed values for validation
const ALLOWED_INSTRUMENT_TYPES = [
  'Trumpet', 'Piccolo Trumpet', 'Flugelhorn', 'Cornet', 'Tenor Trombone', 'Bass Trombone', 
  'Alto Trombone', 'Contrabass Trombone', 'French Horn', 'Tuba', 'Sousaphone', 'Euphonium', 
  'Baritone Horn', 'Wagner Tuba', 'Ophicleide', 'Tenor Horn', 'Mellophone'
];

const ALLOWED_BRANDS = [
  'ACB (Austin Custom Brass)', 'Alliance', 'AR Resonance', 'Bach (Vincent Bach)', 'Best Brass', 
  'Blessing (E.K. Blessing)', 'Breslmair', 'Bruno Tilz', 'Curry', 'Coppergate', 'Denis Wick', 
  'Donat', 'Frate', 'Frost', 'Giddings & Webster', 'Giardinelli', 'Greg Black', 'GR', 
  'G.W. Mouthpieces', 'Hammond Design', 'Helix Brass', 'Holton (Holton-Farkas)', 'JC Custom', 
  'Josef Klier', 'King', 'K&G', 'La Tromba', 'Laskey', 'Legends Brass', 'Lotus', 'Marcinkiewicz', 
  'Meeuwsen', 'Monette', 'O\'Malley', 'Parduba', 'Patrick', 'Pickett', 'Purviance', 'Reeves', 
  'Robert Tucci (formerly Perantucci)', 'Rudy Mück', 'Schilke', 'Shires', 'Stork', 'Stomvi', 
  'Toshi', 'Vennture', 'Warburton', 'Wedge', 'Yamaha'
];

const ALLOWED_CONDITIONS = ['New', 'Like New', 'Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

const ALLOWED_STATUSES = ['active', 'paused', 'sold', 'deleted', 'loaned'];

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com', 'yopmail.com', 'trashmail.com', 'fakeinbox.com', 'getnada.com', 'dispostable.com', 'maildrop.cc', 'mintemail.com', 'mytemp.email', 'throwawaymail.com', 'mailnesia.com', 'spamgourmet.com', 'sharklasers.com', 'spam4.me', 'mailcatch.com', 'inboxbear.com', 'spambog.com', 'spambox.us', 'temp-mail.org', 'temp-mail.ru', 'tempmail.net', 'tempmailo.com', 'emailondeck.com', 'moakt.com', 'anonbox.net', 'mail-temp.com', 'tempail.com', 'emailtemporario.com.br', 'mail7.io', 'disposablemail.com', 'dropmail.me', 'easytrashmail.com', 'eyepaste.com', 'fakemailgenerator.com', 'mailcatch.com', 'maildrop.cc', 'mailnesia.com', 'mailnull.com', 'meltmail.com', 'nowmymail.com', 'objectmail.com', 'onewaymail.com', 'proxymail.eu', 'sharklasers.com', 'spamavert.com', 'spamfree24.com', 'spamslicer.com', 'spamspot.com', 'tempemail.net', 'tempinbox.com', 'trashmail.com', 'yopmail.com'
];
function isDisposableEmail(email) {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
}

// File validation function
const validateImageData = (photos) => {
  if (!Array.isArray(photos)) {
    return { valid: false, error: 'Photos must be an array.' };
  }

  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/gif',
    'image/webp'
  ];

  const maxSize = 5 * 1024 * 1024; // 5MB in bytes

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    
    // Check if it's a base64 data URL
    if (typeof photo === 'string' && photo.startsWith('data:')) {
      const matches = photo.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return { valid: false, error: `Photo ${i + 1}: Invalid data URL format.` };
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];
      
      // Validate MIME type
      if (!allowedTypes.includes(mimeType)) {
        return { valid: false, error: `Photo ${i + 1}: Invalid file type. Only PNG, JPG, JPEG, GIF, and WebP are allowed.` };
      }
      
      // Check file size (base64 is ~33% larger than binary)
      const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
      if (sizeInBytes > maxSize) {
        return { valid: false, error: `Photo ${i + 1}: File too large. Maximum size is 5MB.` };
      }
      
      // Additional validation: check for common malicious patterns
      if (base64Data.includes('<?php') || base64Data.includes('<script') || base64Data.includes('javascript:')) {
        return { valid: false, error: `Photo ${i + 1}: File contains potentially malicious content.` };
      }

      // Try to process with sharp to ensure it's a real image
      try {
        const buffer = Buffer.from(base64Data, 'base64');
        sharp(buffer).metadata(); // Will throw if not a valid image
      } catch (err) {
        return { valid: false, error: `Photo ${i + 1}: File is not a valid image.` };
      }
    } else if (typeof photo === 'string' && photo.startsWith('http')) {
      // Allow existing URLs (for editing)
      continue;
    } else {
      return { valid: false, error: `Photo ${i + 1}: Invalid photo format.` };
    }
  }
  
  return { valid: true };
};

// Comprehensive field validation function
const validateListingFields = (data) => {
  const errors = [];

  // Instrument type validation
  if (!data.instrument_type || typeof data.instrument_type !== 'string') {
    errors.push('Instrument type is required and must be a string.');
  } else if (!ALLOWED_INSTRUMENT_TYPES.includes(data.instrument_type)) {
    errors.push(`Invalid instrument type. Must be one of: ${ALLOWED_INSTRUMENT_TYPES.join(', ')}`);
  }

  // Brand validation
  if (!data.brand || typeof data.brand !== 'string') {
    errors.push('Brand is required and must be a string.');
  } else if (data.brand.length > 100) {
    errors.push('Brand must be 100 characters or less.');
  }

  // Model validation
  if (!data.model || typeof data.model !== 'string') {
    errors.push('Model is required and must be a string.');
  } else if (data.model.trim().length < 1) {
    errors.push('Model cannot be empty.');
  } else if (data.model.length > 100) {
    errors.push('Model must be 100 characters or less.');
  }

  // Condition validation
  if (!data.condition || typeof data.condition !== 'string') {
    errors.push('Condition is required and must be a string.');
  } else if (!ALLOWED_CONDITIONS.includes(data.condition)) {
    errors.push(`Invalid condition. Must be one of: ${ALLOWED_CONDITIONS.join(', ')}`);
  }

  // Price validation
  if (data.price === undefined || data.price === null || data.price === '') {
    errors.push('Price is required.');
  } else {
    const price = parseFloat(data.price);
    if (isNaN(price)) {
      errors.push('Price must be a valid number.');
    } else if (price <= 0) {
      errors.push('Price must be greater than 0.');
    } else if (price > 100000) {
      errors.push('Price cannot exceed $100,000.');
    }
  }

  // Description validation
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required and must be a string.');
  } else if (data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long.');
  } else if (data.description.length > 2000) {
    errors.push('Description must be 2000 characters or less.');
  }

  // Boolean field validation
  if (data.open_to_swap !== undefined && data.open_to_swap !== null) {
    if (typeof data.open_to_swap !== 'boolean' && typeof data.open_to_swap !== 'string') {
      errors.push('open_to_swap must be a boolean or string.');
    }
  }

  if (data.open_to_loan !== undefined && data.open_to_loan !== null) {
    if (typeof data.open_to_loan !== 'boolean' && typeof data.open_to_loan !== 'string') {
      errors.push('open_to_loan must be a boolean or string.');
    }
  }

  // PayPal link validation (if provided)
  if (data.paypal_link_override !== undefined && data.paypal_link_override !== null && data.paypal_link_override !== '') {
    if (typeof data.paypal_link_override !== 'string') {
      errors.push('PayPal link must be a string.');
    } else if (!PAYPAL_ME_REGEX.test(data.paypal_link_override) && !EMAIL_REGEX.test(data.paypal_link_override)) {
      errors.push('PayPal link must be a valid PayPal.Me URL or email address.');
    } else if (EMAIL_REGEX.test(data.paypal_link_override) && isDisposableEmail(data.paypal_link_override)) {
      errors.push('Disposable email addresses are not allowed for PayPal.');
    }
  }

  // Status validation (for updates)
  if (data.status !== undefined && data.status !== null) {
    if (typeof data.status !== 'string') {
      errors.push('Status must be a string.');
    } else if (!ALLOWED_STATUSES.includes(data.status)) {
      errors.push(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`);
    }
  }

  // Photos validation
  if (data.photos !== undefined && data.photos !== null) {
    if (!Array.isArray(data.photos)) {
      errors.push('Photos must be an array.');
    } else if (data.photos.length > 6) {
      errors.push('Maximum 6 photos allowed.');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
};

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
    
    // Add user_id filter
    if (user_id === 'me' && req.user && req.user.userId) {
      filters.user_id = req.user.userId;
    } else if (user_id && !isNaN(Number(user_id))) {
      filters.user_id = Number(user_id);
    } else {
      // Only show active listings for public browsing
      filters.status = 'active';
    }
    
    // Get available models, brands, and instrument types for autocomplete (excluding the current filters)
    const modelFilters = { ...filters };
    delete modelFilters.model;
    delete modelFilters.brand;
    delete modelFilters.instrument_type;
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
    let page = 1;
    if (req.query.page !== undefined) {
      const parsedPage = Number(req.query.page);
      if (Number.isInteger(parsedPage) && parsedPage > 0) {
        page = parsedPage;
      }
    }
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;
    
    const listings = await prisma.listing.findMany({
      where: filters,
      select: {
        listing_id: true,
        instrument_type: true,
        brand: true,
        model: true,
        condition: true,
        price: true,
        description: true,
        photos: true,
        open_to_swap: true,
        open_to_loan: true,
        status: true,
        created_at: true,
        paypal_link_override: true,
        user: {
          select: {
            user_id: true,
            name: true,
            nickname: true,
            average_rating: true,
            rating_count: true,
            location_state: true,
            location_postcode: true,
            paypal_link: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: skip
    });
    
    // Get total count for pagination
    const totalCount = await prisma.listing.count({ where: filters });
    
    // Optimize listings data - only send first photo and truncate description
    const optimizedListings = listings.map(listing => ({
      ...listing,
      photos: listing.photos && listing.photos.length > 0 ? [listing.photos[0]] : [], // Only first photo
      description: listing.description ? listing.description.substring(0, 150) + (listing.description.length > 150 ? '...' : '') : '',
      paypal_link_effective: listing.paypal_link_override || listing.user.paypal_link || null
    }));
    
    // Set cache headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'ETag': `"${Date.now()}-${totalCount}"` // Simple ETag for caching
    });
    
    // Return optimized data
    res.json({
      listings: optimizedListings,
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
    // Enforce per-user active listing limit
    const activeCount = await prisma.listing.count({
      where: { user_id: req.user.userId, status: 'active' }
    });
    if (activeCount >= 20) {
      return res.status(429).json({ error: 'Listing limit reached. You may have up to 20 active listings.' });
    }
    // Comprehensive field validation
    const fieldValidation = validateListingFields(req.body);
    if (!fieldValidation.valid) {
      console.error('Field validation failed:', fieldValidation.errors);
      return res.status(400).json({ 
        error: 'Validation failed.', 
        details: fieldValidation.errors 
      });
    }

    const { instrument_type, brand, model, condition, price, description, open_to_swap, open_to_loan, paypal_link_override, photos } = req.body;
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
    const validationResult = validateImageData(photos);
    if (!validationResult.valid) {
      return res.status(400).json({ error: validationResult.error });
    }
    
    // Optimize images before storing
    let optimizedPhotos = [];
    if (photos && photos.length > 0) {
      optimizedPhotos = await Promise.all(
        photos.map(async (photo) => {
          if (photo.startsWith('data:')) {
            return await ImageOptimizer.optimizeImage(photo, 85);
          }
          return photo; // Keep existing URLs as-is
        })
      );
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
        photos: optimizedPhotos || [],
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
    
    // Set cache headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=600', // Cache for 10 minutes
      'ETag': `"${listing.listing_id}-${listing.updated_at.getTime()}"` // ETag based on listing ID and update time
    });
    
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
    
    // Comprehensive field validation
    const fieldValidation = validateListingFields(req.body);
    if (!fieldValidation.valid) {
      console.error('Field validation failed:', fieldValidation.errors);
      return res.status(400).json({ 
        error: 'Validation failed.', 
        details: fieldValidation.errors 
      });
    }

    const { instrument_type, brand, model, condition, price, description, photos, open_to_swap, open_to_loan, status, paypal_link_override } = req.body;
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
    const validationResult = validateImageData(photos);
    if (!validationResult.valid) {
      return res.status(400).json({ error: validationResult.error });
    }
    
    // Optimize images before storing
    let optimizedPhotos = [];
    if (photos && photos.length > 0) {
      optimizedPhotos = await Promise.all(
        photos.map(async (photo) => {
          if (photo.startsWith('data:')) {
            return await ImageOptimizer.optimizeImage(photo, 85);
          }
          return photo; // Keep existing URLs as-is
        })
      );
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
          photos: optimizedPhotos || [],
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