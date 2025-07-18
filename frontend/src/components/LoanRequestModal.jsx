import React, { useState } from 'react';
import axios from '../api/axios';

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

  if (!isOpen) return null;

  // Calculate minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Request Loan</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Item</label>
                <p className="form-control-plaintext">
                  {listing.instrument_type} - {listing.brand} {listing.model}
                </p>
              </div>

              <div className="mb-3">
                <label className="form-label">Owner</label>
                <p className="form-control-plaintext">
                  {listing.user.name}
                </p>
              </div>

              <div className="mb-3">
                <label htmlFor="expectedReturnDate" className="form-label">
                  Expected Return Date *
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="expectedReturnDate"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  min={minDate}
                  required
                />
                <div className="form-text">
                  Please select when you expect to return this item
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">
                  Notes (Optional)
                </label>
                <textarea
                  className="form-control"
                  id="notes"
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information about your loan request..."
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Requesting...' : 'Request Loan'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default LoanRequestModal; 