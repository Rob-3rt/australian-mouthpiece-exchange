import React, { useState } from 'react';
import axios from '../api/axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';

const LoanRequestModal = ({ listing, isOpen, onClose, onSuccess }) => {
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!expectedReturnDate) {
      setError('Please select an expected return date');
      return;
    }
    const returnDate = new Date(expectedReturnDate);
    if (returnDate <= new Date()) {
      setError('Expected return date must be in the future');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await axios.post('/api/loans', {
        listing_id: listing.listing_id,
        start_date: new Date().toISOString().split('T')[0], // today
        expected_return_date: expectedReturnDate,
        notes: notes.trim() || null
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create loan request');
    } finally {
      setLoading(false);
    }
  };

  // Calculate minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Request Loan</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          <Box mb={2}>
            <Typography variant="subtitle2">Item</Typography>
            <Typography variant="body2" color="text.secondary">
              {listing.instrument_type} - {listing.brand} {listing.model}
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="subtitle2">Owner</Typography>
            <Typography variant="body2" color="text.secondary">
              {listing.user.name}
            </Typography>
          </Box>
          <TextField
            label="Expected Return Date *"
            type="date"
            value={expectedReturnDate}
            onChange={e => setExpectedReturnDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minDate }}
            fullWidth
            required
            sx={{ mb: 2 }}
            helperText="Please select when you expect to return this item"
          />
          <TextField
            label="Notes (Optional)"
            multiline
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional information about your loan request..."
            fullWidth
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={22} /> : 'Request Loan'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LoanRequestModal; 