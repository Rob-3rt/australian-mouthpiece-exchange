const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getUserLoans,
  getLoan,
  createLoan,
  updateLoan,
  returnLoan,
  cancelLoan,
  getLoanStats,
  approveLoan,
  refuseLoan,
  getIncomingRequests,
  getOutgoingRequests,
  getCurrentLoans,
  getLoanHistory
} = require('../controllers/loanController');

// Apply auth middleware to all loan routes
router.use(auth);

// Get user's loans (with optional type filter: 'given', 'received', 'all')
router.get('/', getUserLoans);

// Get loan statistics
router.get('/stats', getLoanStats);

// New endpoints for dashboard sections (must be before /:id)
router.get('/incoming', getIncomingRequests);
router.get('/outgoing', getOutgoingRequests);
router.get('/current', getCurrentLoans);
router.get('/history', getLoanHistory);

// Get a specific loan
router.get('/:id', getLoan);

// Create a new loan request
router.post('/', createLoan);

// Update loan status
router.put('/:id', updateLoan);

// Mark loan as returned (borrower only)
router.patch('/:id/return', returnLoan);

// Cancel loan (lender only)
router.patch('/:id/cancel', cancelLoan);

router.patch('/:id/approve', approveLoan);
router.patch('/:id/refuse', refuseLoan);
router.patch('/:id/request_return', require('../controllers/loanController').requestReturn);
router.patch('/:id/confirm_return', require('../controllers/loanController').confirmReturn);

module.exports = router; 