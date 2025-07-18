# Loan Functionality Documentation

## Overview

The Australian Mouthpiece Exchange now supports loan functionality, allowing users to loan their mouthpieces to other users for a specified period. This feature enables community sharing while maintaining proper tracking and accountability.

## Features

### Core Loan Features
- **Loan Requests**: Users can request to borrow mouthpieces from listings marked as "Open to Loan"
- **Loan Tracking**: Complete tracking of loan status, dates, and participants
- **Return Management**: Easy marking of loans as returned with automatic listing status updates
- **Loan Statistics**: Dashboard showing loan history and statistics
- **Overdue Detection**: Automatic detection of overdue loans

### Loan Statuses
- **Active**: Currently borrowed and not yet returned
- **Returned**: Successfully returned to the lender
- **Overdue**: Past the expected return date but still active
- **Cancelled**: Loan was cancelled by the lender

## Database Schema

### New Loan Model
```prisma
model Loan {
  loan_id          Int       @id @default(autoincrement())
  listing_id       Int
  lender_id        Int       // Owner of the item
  borrower_id      Int       // Person borrowing the item
  start_date       DateTime  @default(now())
  expected_return_date DateTime
  actual_return_date DateTime?
  status           String    @default("active")
  notes            String?   // Any additional notes about the loan
  created_at       DateTime  @default(now())
  updated_at       DateTime  @updatedAt
  
  listing          Listing   @relation(fields: [listing_id], references: [listing_id])
  lender           User      @relation("LoansGiven", fields: [lender_id], references: [user_id])
  borrower         User      @relation("LoansReceived", fields: [borrower_id], references: [user_id])
}
```

### Updated Listing Model
- Added `open_to_loan` boolean field
- Updated status to include 'loaned' state
- Added relationship to loans

### Updated User Model
- Added `loans_given` and `loans_received` relationships

## API Endpoints

### Loan Management
- `GET /api/loans` - Get user's loans (with optional type filter: 'given', 'received', 'all')
- `GET /api/loans/stats` - Get loan statistics for the user
- `GET /api/loans/:id` - Get a specific loan
- `POST /api/loans` - Create a new loan request
- `PUT /api/loans/:id` - Update loan status
- `PATCH /api/loans/:id/return` - Mark loan as returned (borrower only)
- `PATCH /api/loans/:id/cancel` - Cancel loan (lender only)

### Updated Listing Endpoints
- `POST /api/listings` - Now includes `open_to_loan` field
- `PUT /api/listings/:id` - Now includes `open_to_loan` field

## Frontend Components

### LoanManagement.jsx
A comprehensive component for managing loans with:
- Statistics dashboard
- Tabbed interface for different loan types
- Loan cards with status badges
- Action buttons for returning/cancelling loans
- Overdue detection and highlighting

### LoanRequestModal.jsx
A modal component for requesting loans with:
- Date picker for expected return date
- Optional notes field
- Validation for future dates
- Error handling and loading states

### Updated CreateListingModal.jsx
- Added "Open to Loan" toggle option
- Integrated with existing form validation

## Usage Examples

### Creating a Loan Request
```javascript
const response = await axios.post('/api/loans', {
  listing_id: 123,
  expected_return_date: '2025-08-18',
  notes: 'Need this for a performance next week'
});
```

### Getting User Loans
```javascript
// Get all loans
const allLoans = await axios.get('/api/loans');

// Get only loans given
const givenLoans = await axios.get('/api/loans?type=given');

// Get only loans received
const receivedLoans = await axios.get('/api/loans?type=received');
```

### Marking a Loan as Returned
```javascript
await axios.patch(`/api/loans/${loanId}/return`);
```

### Getting Loan Statistics
```javascript
const stats = await axios.get('/api/loans/stats');
// Returns: { loansGiven, activeLoansGiven, loansReceived, activeLoansReceived, overdueLoans }
```

## Business Logic

### Loan Creation
1. Validates that the listing exists and is available for loan
2. Checks that the listing is not already on loan
3. Ensures the borrower is not the owner
4. Validates that the expected return date is in the future
5. Creates the loan and updates listing status to 'loaned'

### Loan Return
1. Only the borrower can mark a loan as returned
2. Updates loan status to 'returned' and sets actual return date
3. Automatically updates listing status back to 'active'

### Loan Cancellation
1. Only the lender can cancel a loan
2. Updates loan status to 'cancelled'
3. Automatically updates listing status back to 'active'

### Overdue Detection
- Loans are automatically detected as overdue when the expected return date has passed
- Frontend displays overdue loans with red badges
- Statistics include overdue loan counts

## Security Considerations

### Authorization
- Users can only view loans they're involved in (as lender or borrower)
- Only borrowers can mark loans as returned
- Only lenders can cancel loans
- Users cannot loan their own items

### Validation
- Expected return dates must be in the future
- Listing must be available for loan
- Listing must not already be on loan
- All required fields are validated

## Testing

### Test Scripts
- `test-loans.js` - Comprehensive test of loan functionality
- `cleanup-test-data.js` - Cleanup script for test data

### Test Coverage
- User creation and listing creation
- Loan creation and validation
- Status updates and listing status changes
- Statistics calculation
- Loan return and cancellation

## Future Enhancements

### Potential Features
- **Loan Extensions**: Allow borrowers to request extensions
- **Reminder System**: Email notifications for upcoming returns
- **Loan History**: Detailed history with timestamps
- **Rating System**: Rate loan experiences
- **Insurance**: Optional insurance for valuable items
- **Shipping Tracking**: Track shipping of loaned items

### Technical Improvements
- **Real-time Updates**: WebSocket notifications for loan status changes
- **Bulk Operations**: Manage multiple loans at once
- **Advanced Filtering**: Filter loans by date, status, item type
- **Export Functionality**: Export loan history to CSV/PDF

## Migration Notes

### Database Migration
The loan functionality requires a database migration that:
1. Creates the new `Loan` table
2. Adds `open_to_loan` field to `Listing` table
3. Updates `User` table with loan relationships
4. Adds 'loaned' status to listing status options

### Backward Compatibility
- Existing listings will have `open_to_loan` set to `false` by default
- Existing functionality remains unchanged
- No breaking changes to existing APIs

## Support

For questions or issues with the loan functionality, please refer to:
- API documentation in the codebase
- Frontend component documentation
- Database schema in `prisma/schema.prisma`
- Test files for usage examples 