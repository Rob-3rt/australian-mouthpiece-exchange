import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Button } from '@mui/material';

const LoanCard = ({ loan, user, onApprove, onRefuse, onReturn, onCancel }) => {
  const { listing, lender, borrower, status, start_date, expected_return_date, actual_return_date } = loan;
  const isLender = user?.userId === lender.user_id;
  const isBorrower = user?.userId === borrower.user_id;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'info.main';
      case 'active': return 'success.main';
      case 'returned': return 'secondary.main';
      case 'cancelled': return 'warning.main';
      case 'refused': return 'error.main';
      default: return 'grey.500';
    }
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 2, cursor: 'pointer', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
        <CardMedia
          component="img"
          image={listing.photos && listing.photos.length > 0 ? listing.photos[0] : '/no-image.png'}
          alt={listing.brand + ' ' + listing.model}
          sx={{ width: { xs: '100%', sm: 180 }, height: 180, objectFit: 'cover' }}
        />
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700} mb={1}>
            {listing.brand} {listing.model}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            {listing.instrument_type} • {listing.condition}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            {listing.description}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            <b>Status:</b> <span style={{ color: getStatusColor(status) }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            <b>Start:</b> {start_date ? new Date(start_date).toLocaleDateString() : '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            <b>Expected Return:</b> {expected_return_date ? new Date(expected_return_date).toLocaleDateString() : '-'}
          </Typography>
          {actual_return_date && (
            <Typography variant="body2" color="text.secondary" mb={1}>
              <b>Returned:</b> {new Date(actual_return_date).toLocaleDateString()}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" mb={1}>
            <b>{isLender ? 'Borrower' : 'Lender'}:</b> {isLender ? (borrower.nickname || borrower.name) : (lender.nickname || lender.name)}
          </Typography>
          {/* Action Buttons */}
          <Box mt={2} display="flex" gap={1}>
            {status === 'pending' && isLender && (
              <>
                <Button variant="contained" color="success" size="small" onClick={() => onApprove(loan.loan_id)}>Approve</Button>
                <Button variant="contained" color="error" size="small" onClick={() => onRefuse(loan.loan_id)}>Refuse</Button>
              </>
            )}
            {status === 'active' && isBorrower && (
              <Button variant="contained" color="success" size="small" onClick={() => onReturn(loan.loan_id)}>Mark as Returned</Button>
            )}
            {status === 'active' && isLender && (
              <Button variant="contained" color="warning" size="small" onClick={() => onCancel(loan.loan_id)}>Cancel Loan</Button>
            )}
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};

export default LoanCard; 