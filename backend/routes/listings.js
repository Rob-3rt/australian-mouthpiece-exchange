const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllListings,
  createListing,
  getListing,
  updateListing,
  deleteListing,
  pauseListing
} = require('../controllers/listingsController');

// Apply auth middleware conditionally for "my listings"
router.get('/', (req, res, next) => {
  if (req.query.user_id === 'me') {
    // Apply auth middleware for personal listings
    auth(req, res, next);
  } else {
    // Skip auth for public browsing
    next();
  }
}, getAllListings);
router.post('/', auth, createListing);
router.get('/:id', getListing);
router.put('/:id', auth, updateListing);
router.delete('/:id', auth, deleteListing);
router.patch('/:id/pause', auth, pauseListing);

module.exports = router; 