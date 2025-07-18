const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const notificationService = require('../utils/notificationService');

// Get all loans for a user (both as lender and borrower)
exports.getUserLoans = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type } = req.query; // 'given', 'received', or 'all'

    let whereClause = {};
    
    if (type === 'given') {
      whereClause.lender_id = userId;
    } else if (type === 'received') {
      whereClause.borrower_id = userId;
    } else {
      // Default to 'all' - get both given and received loans
      whereClause = {
        OR: [
          { lender_id: userId },
          { borrower_id: userId }
        ]
      };
    }

    const loans = await prisma.loan.findMany({
      where: whereClause,
      include: {
        listing: {
          select: {
            listing_id: true,
            instrument_type: true,
            brand: true,
            model: true,
            photos: true
          }
        },
        lender: {
          select: {
            user_id: true,
            name: true,
            nickname: true,
            location_state: true,
            location_postcode: true
          }
        },
        borrower: {
          select: {
            user_id: true,
            name: true,
            nickname: true,
            location_state: true,
            location_postcode: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(loans);
  } catch (error) {
    console.error('Error fetching user loans:', error);
    res.status(500).json({ error: 'Failed to fetch loans.' });
  }
};

// Get a specific loan by ID
exports.getLoan = async (req, res) => {
  try {
    const loanId = parseInt(req.params.id);
    if (!loanId) {
      return res.status(400).json({ error: 'Loan ID is required.' });
    }
    const userId = req.user.userId;

    const loan = await prisma.loan.findUnique({
      where: { loan_id: loanId },
      include: {
        listing: {
          select: {
            listing_id: true,
            instrument_type: true,
            brand: true,
            model: true,
            photos: true,
            description: true
          }
        },
        lender: {
          select: {
            user_id: true,
            name: true,
            nickname: true,
            location_state: true,
            location_postcode: true,
            email: true
          }
        },
        borrower: {
          select: {
            user_id: true,
            name: true,
            nickname: true,
            location_state: true,
            location_postcode: true,
            email: true
          }
        }
      }
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

    // Check if user is authorized to view this loan
    if (loan.lender_id !== userId && loan.borrower_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this loan.' });
    }

    res.json(loan);
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({ error: 'Failed to fetch loan.' });
  }
};

// Create a new loan request
exports.createLoan = async (req, res) => {
  try {
    const { listing_id, start_date, expected_return_date, notes } = req.body;
    const borrowerId = req.user.userId;

    // Validate required fields
    if (!listing_id || !start_date || !expected_return_date) {
      return res.status(400).json({ error: 'Listing ID, start date, and expected return date are required.' });
    }

    // Check if listing exists and is available for loan
    const listing = await prisma.listing.findUnique({
      where: { listing_id: parseInt(listing_id) },
      include: { user: true }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    if (!listing.open_to_loan) {
      return res.status(400).json({ error: 'This item is not available for loan.' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ error: 'This item is not currently available.' });
    }

    if (listing.user_id === borrowerId) {
      return res.status(400).json({ error: 'You cannot loan your own item.' });
    }

    // Check if there's already a pending or active loan for this listing
    const existingLoan = await prisma.loan.findFirst({
      where: {
        listing_id: parseInt(listing_id),
        status: { in: ['active', 'pending'] }
      }
    });

    if (existingLoan) {
      return res.status(400).json({ error: 'This item already has a pending or active loan.' });
    }

    const startDate = new Date(start_date);
    const expectedReturn = new Date(expected_return_date);
    const now = new Date();
    if (startDate < now) {
      return res.status(400).json({ error: 'Start date must be today or in the future.' });
    }
    if (expectedReturn <= startDate) {
      return res.status(400).json({ error: 'Expected return date must be after start date.' });
    }

    // Create the loan with status 'pending'
    const loan = await prisma.loan.create({
      data: {
        listing_id: parseInt(listing_id),
        lender_id: listing.user_id,
        borrower_id: borrowerId,
        start_date: startDate,
        expected_return_date: expectedReturn,
        notes: notes || null,
        status: 'pending'
      },
      include: {
        listing: {
          select: {
            listing_id: true,
            instrument_type: true,
            brand: true,
            model: true
          }
        },
        lender: {
          select: {
            user_id: true,
            name: true,
            nickname: true,
            email: true
          }
        },
        borrower: {
          select: {
            user_id: true,
            name: true,
            nickname: true,
            email: true
          }
        }
      }
    });

    // Send message/notification to lender
    await prisma.message.create({
      data: {
        from_user_id: borrowerId,
        to_user_id: loan.lender_id,
        content: `Loan request for ${loan.listing.brand} ${loan.listing.model} (${loan.listing.instrument_type}) starting ${startDate.toLocaleDateString()} until ${expectedReturn.toLocaleDateString()}. Notes: ${notes || 'None'}`,
        listing_id: loan.listing.listing_id
      }
    });
    if (notificationService.isEmailConfigured()) {
      notificationService.sendMessageNotification(
        loan.lender,
        loan.borrower,
        `Loan request for ${loan.listing.brand} ${loan.listing.model} (${loan.listing.instrument_type}) starting ${startDate.toLocaleDateString()} until ${expectedReturn.toLocaleDateString()}. Notes: ${notes || 'None'}`,
        loan.listing
      ).catch(() => {});
    }

    res.status(201).json(loan);
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ error: 'Failed to create loan.' });
  }
};

// Approve a pending loan (lender only)
exports.approveLoan = async (req, res) => {
  try {
    const loanId = parseInt(req.params.id);
    const userId = req.user.userId;
    const loan = await prisma.loan.findUnique({ where: { loan_id: loanId }, include: { listing: true, lender: true, borrower: true } });
    if (!loan) return res.status(404).json({ error: 'Loan not found.' });
    if (loan.lender_id !== userId) return res.status(403).json({ error: 'Only the lender can approve.' });
    if (loan.status !== 'pending') return res.status(400).json({ error: 'Loan is not pending.' });
    // Approve the loan
    const updatedLoan = await prisma.loan.update({
      where: { loan_id: loanId },
      data: { status: 'on loan' },
      include: {
        listing: true,
        lender: true,
        borrower: true
      }
    });
    // Set listing status to 'loaned'
    await prisma.listing.update({ where: { listing_id: loan.listing_id }, data: { status: 'loaned' } });
    // Send message/notification to borrower
    await prisma.message.create({
      data: {
        from_user_id: loan.lender_id,
        to_user_id: loan.borrower_id,
        content: `Your loan request for ${loan.listing.brand} ${loan.listing.model} has been approved!`,
        listing_id: loan.listing.listing_id
      }
    });
    if (notificationService.isEmailConfigured()) {
      notificationService.sendMessageNotification(
        loan.borrower,
        loan.lender,
        `Your loan request for ${loan.listing.brand} ${loan.listing.model} has been approved!`,
        loan.listing
      ).catch(() => {});
    }
    res.json(updatedLoan);
  } catch (error) {
    console.error('Error approving loan:', error);
    res.status(500).json({ error: 'Failed to approve loan.' });
  }
};

// Refuse a pending loan (lender only)
exports.refuseLoan = async (req, res) => {
  try {
    const loanId = parseInt(req.params.id);
    const userId = req.user.userId;
    const loan = await prisma.loan.findUnique({ where: { loan_id: loanId }, include: { listing: true, lender: true, borrower: true } });
    if (!loan) return res.status(404).json({ error: 'Loan not found.' });
    if (loan.lender_id !== userId) return res.status(403).json({ error: 'Only the lender can refuse.' });
    if (loan.status !== 'pending') return res.status(400).json({ error: 'Loan is not pending.' });
    // Refuse the loan
    const updatedLoan = await prisma.loan.update({
      where: { loan_id: loanId },
      data: { status: 'refused' },
      include: {
        listing: true,
        lender: true,
        borrower: true
      }
    });
    // Send message/notification to borrower
    await prisma.message.create({
      data: {
        from_user_id: loan.lender_id,
        to_user_id: loan.borrower_id,
        content: `Your loan request for ${loan.listing.brand} ${loan.listing.model} has been refused.`,
        listing_id: loan.listing.listing_id
      }
    });
    if (notificationService.isEmailConfigured()) {
      notificationService.sendMessageNotification(
        loan.borrower,
        loan.lender,
        `Your loan request for ${loan.listing.brand} ${loan.listing.model} has been refused.`,
        loan.listing
      ).catch(() => {});
    }
    res.json(updatedLoan);
  } catch (error) {
    console.error('Error refusing loan:', error);
    res.status(500).json({ error: 'Failed to refuse loan.' });
  }
};

// Update loan status (return, cancel, etc.)
exports.updateLoan = async (req, res) => {
  try {
    const loanId = parseInt(req.params.id);
    const { status, notes } = req.body;
    const userId = req.user.userId;

    // Get the loan
    const loan = await prisma.loan.findUnique({
      where: { loan_id: loanId },
      include: { listing: true }
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

    // Check authorization - only lender or borrower can update
    if (loan.lender_id !== userId && loan.borrower_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this loan.' });
    }

    // Validate status transitions
    const validStatuses = ['active', 'returned', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    // Handle status-specific logic
    let updateData = { status };
    
    if (status === 'returned') {
      updateData.actual_return_date = new Date();
    }

    if (notes) {
      updateData.notes = notes;
    }

    // Update the loan
    const updatedLoan = await prisma.loan.update({
      where: { loan_id: loanId },
      data: updateData,
      include: {
        listing: {
          select: {
            listing_id: true,
            instrument_type: true,
            brand: true,
            model: true
          }
        },
        lender: {
          select: {
            user_id: true,
            name: true,
            nickname: true
          }
        },
        borrower: {
          select: {
            user_id: true,
            name: true,
            nickname: true
          }
        }
      }
    });

    // If loan is returned or cancelled, make listing available again
    if (status === 'returned' || status === 'cancelled') {
      await prisma.listing.update({
        where: { listing_id: loan.listing_id },
        data: { status: 'active' }
      });
    }

    res.json(updatedLoan);
  } catch (error) {
    console.error('Error updating loan:', error);
    res.status(500).json({ error: 'Failed to update loan.' });
  }
};

// Mark loan as returned
exports.returnLoan = async (req, res) => {
  try {
    const loanId = parseInt(req.params.id);
    const userId = req.user.userId;

    const loan = await prisma.loan.findUnique({
      where: { loan_id: loanId },
      include: { listing: true }
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

    // Only the borrower can mark as returned
    if (loan.borrower_id !== userId) {
      return res.status(403).json({ error: 'Only the borrower can mark a loan as returned.' });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({ error: 'Loan is not active.' });
    }

    // Update loan status
    const updatedLoan = await prisma.loan.update({
      where: { loan_id: loanId },
      data: {
        status: 'returned',
        actual_return_date: new Date()
      },
      include: {
        listing: {
          select: {
            listing_id: true,
            instrument_type: true,
            brand: true,
            model: true
          }
        },
        lender: {
          select: {
            user_id: true,
            name: true,
            nickname: true
          }
        },
        borrower: {
          select: {
            user_id: true,
            name: true,
            nickname: true
          }
        }
      }
    });

    // Make listing available again
    await prisma.listing.update({
      where: { listing_id: loan.listing_id },
      data: { status: 'active' }
    });

    res.json(updatedLoan);
  } catch (error) {
    console.error('Error returning loan:', error);
    res.status(500).json({ error: 'Failed to return loan.' });
  }
};

// Cancel a loan (only lender can cancel)
exports.cancelLoan = async (req, res) => {
  try {
    const loanId = parseInt(req.params.id);
    const userId = req.user.userId;

    const loan = await prisma.loan.findUnique({
      where: { loan_id: loanId },
      include: { listing: true }
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

    // Only the lender can cancel
    if (loan.lender_id !== userId) {
      return res.status(403).json({ error: 'Only the lender can cancel a loan.' });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({ error: 'Loan is not active.' });
    }

    // Update loan status
    const updatedLoan = await prisma.loan.update({
      where: { loan_id: loanId },
      data: { status: 'cancelled' },
      include: {
        listing: {
          select: {
            listing_id: true,
            instrument_type: true,
            brand: true,
            model: true
          }
        },
        lender: {
          select: {
            user_id: true,
            name: true,
            nickname: true
          }
        },
        borrower: {
          select: {
            user_id: true,
            name: true,
            nickname: true
          }
        }
      }
    });

    // Make listing available again
    await prisma.listing.update({
      where: { listing_id: loan.listing_id },
      data: { status: 'active' }
    });

    res.json(updatedLoan);
  } catch (error) {
    console.error('Error cancelling loan:', error);
    res.status(500).json({ error: 'Failed to cancel loan.' });
  }
};

// Get loan statistics for a user
exports.getLoanStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await prisma.$transaction([
      // Loans given
      prisma.loan.count({
        where: { lender_id: userId }
      }),
      // Active loans given
      prisma.loan.count({
        where: { 
          lender_id: userId,
          status: 'active'
        }
      }),
      // Loans received
      prisma.loan.count({
        where: { borrower_id: userId }
      }),
      // Active loans received
      prisma.loan.count({
        where: { 
          borrower_id: userId,
          status: 'active'
        }
      }),
      // Overdue loans received
      prisma.loan.count({
        where: { 
          borrower_id: userId,
          status: 'active',
          expected_return_date: {
            lt: new Date()
          }
        }
      })
    ]);

    res.json({
      loansGiven: stats[0],
      activeLoansGiven: stats[1],
      loansReceived: stats[2],
      activeLoansReceived: stats[3],
      overdueLoans: stats[4]
    });
  } catch (error) {
    console.error('Error fetching loan stats:', error);
    res.status(500).json({ error: 'Failed to fetch loan statistics.' });
  }
}; 

// New endpoints for dashboard sections
exports.getIncomingRequests = async (req, res) => {
  console.log('getIncomingRequests called');
  console.log('req.user:', req.user);
  console.log('req.headers:', req.headers);
  try {
    const userId = req.user && req.user.userId;
    if (!userId) {
      console.log('No userId found in req.user');
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    const loans = await prisma.loan.findMany({
      where: { lender_id: userId, status: 'pending' },
      include: { listing: true, lender: true, borrower: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(loans);
  } catch (error) {
    console.error('Error in getIncomingRequests:', error);
    res.status(500).json({ error: 'Failed to fetch incoming requests.' });
  }
};
exports.getOutgoingRequests = async (req, res) => {
  console.log('getOutgoingRequests called');
  console.log('req.user:', req.user);
  console.log('req.headers:', req.headers);
  try {
    const userId = req.user && req.user.userId;
    if (!userId) {
      console.log('No userId found in req.user');
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    const loans = await prisma.loan.findMany({
      where: { borrower_id: userId, status: 'pending' },
      include: { listing: true, lender: true, borrower: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(loans);
  } catch (error) {
    console.error('Error in getOutgoingRequests:', error);
    res.status(500).json({ error: 'Failed to fetch outgoing requests.' });
  }
};
exports.getCurrentLoans = async (req, res) => {
  console.log('getCurrentLoans called');
  console.log('req.user:', req.user);
  console.log('req.headers:', req.headers);
  try {
    const userId = req.user && req.user.userId;
    if (!userId) {
      console.log('No userId found in req.user');
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    const loans = await prisma.loan.findMany({
      where: {
        OR: [
          { lender_id: userId },
          { borrower_id: userId }
        ],
        status: 'on loan'
      },
      include: { listing: true, lender: true, borrower: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(loans);
  } catch (error) {
    console.error('Error in getCurrentLoans:', error);
    res.status(500).json({ error: 'Failed to fetch current loans.' });
  }
};
exports.getLoanHistory = async (req, res) => {
  console.log('getLoanHistory called');
  console.log('req.user:', req.user);
  console.log('req.headers:', req.headers);
  try {
    const userId = req.user && req.user.userId;
    if (!userId) {
      console.log('No userId found in req.user');
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    const loans = await prisma.loan.findMany({
      where: {
        OR: [
          { lender_id: userId },
          { borrower_id: userId }
        ],
        status: { in: ['returned', 'refused', 'cancelled', 'overdue'] }
      },
      include: { listing: true, lender: true, borrower: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(loans);
  } catch (error) {
    console.error('Error in getLoanHistory:', error);
    res.status(500).json({ error: 'Failed to fetch loan history.' });
  }
}; 