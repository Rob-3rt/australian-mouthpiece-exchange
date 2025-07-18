import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from '../api/axios';

const LoanCard = ({ loan, user, onApprove, onRefuse, onReturn, onCancel, onSold, onRequestReturn }) => {
  const { listing, lender, borrower, status, start_date, expected_return_date, actual_return_date } = loan;
  const isLender = (user?.userId ?? user?.user_id) === lender.user_id;
  const isBorrower = (user?.userId ?? user?.user_id) === borrower.user_id;
  const isActive = status === 'active' || status === 'on loan';
  console.log('LoanCard:', { user, lender, isLender, status });
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [messageSuccess, setMessageSuccess] = useState('');

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

  const handleSendMessage = async () => {
    setMessageLoading(true);
    setMessageError('');
    setMessageSuccess('');
    try {
      await axios.post('/api/messages', {
        to_user_id: isLender ? borrower.user_id : lender.user_id,
        content: message,
        listing_id: listing.listing_id
      });
      setMessageSuccess('Message sent!');
      setMessage('');
    } catch (err) {
      setMessageError('Failed to send message');
    } finally {
      setMessageLoading(false);
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
          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
            <Button variant="outlined" size="small" onClick={() => setMessageOpen(true)}>
              Message
            </Button>
            {status === 'pending' && isLender && (
              <>
                <Button variant="contained" color="success" size="small" onClick={() => onApprove(loan.loan_id)}>Approve</Button>
                <Button variant="contained" color="error" size="small" onClick={() => onRefuse(loan.loan_id)}>Refuse</Button>
              </>
            )}
            {isActive && isBorrower && (
              <Button variant="contained" color="success" size="small" onClick={() => onReturn(loan.loan_id)}>
                Mark as Returned
              </Button>
            )}
            {isActive && isLender && (
              <>
                <Button variant="contained" color="warning" size="small" onClick={() => onCancel(loan.loan_id)}>Cancel Loan</Button>
                <Button variant="contained" color="primary" size="small" onClick={() => onSold(listing.listing_id)}>Mark as Sold</Button>
                <Button variant="contained" color="success" size="small" onClick={() => onReturn(loan.loan_id)}>Returned</Button>
                {onRequestReturn && (
                  <Button variant="outlined" color="info" size="small" onClick={() => onRequestReturn(loan)}>
                    Request Return
                  </Button>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Box>
      {/* Message Modal */}
      <Dialog open={messageOpen} onClose={() => setMessageOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Message {isLender ? (borrower.nickname || borrower.name) : (lender.nickname || lender.name)}</DialogTitle>
        <DialogContent>
          <TextField
            label="Your Message"
            multiline
            rows={5}
            fullWidth
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={messageLoading}
            sx={{ mb: 2 }}
          />
          {messageError && <Typography color="error" variant="body2">{messageError}</Typography>}
          {messageSuccess && <Typography color="success.main" variant="body2">{messageSuccess}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageOpen(false)} disabled={messageLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleSendMessage} disabled={messageLoading || !message.trim()}>
            {messageLoading ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default LoanCard; 