import React, { useEffect, useState } from 'react';
import { Typography, Box, Container, CircularProgress, Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import LoanCard from '../components/LoanCard';

export default function Loans() {
  const { user } = useAuth();
  const [loansGiven, setLoansGiven] = useState([]);
  const [loansReceived, setLoansReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLoans();
    // eslint-disable-next-line
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    setError('');
    try {
      const [givenRes, receivedRes] = await Promise.all([
        axios.get('/api/loans?type=given'),
        axios.get('/api/loans?type=received')
      ]);
      setLoansGiven(givenRes.data);
      setLoansReceived(receivedRes.data);
    } catch (err) {
      setError('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  // Action handlers (reuse from LoanManagement)
  const handleApprove = async (loanId) => {
    await axios.patch(`/api/loans/${loanId}/approve`);
    fetchLoans();
  };
  const handleRefuse = async (loanId) => {
    await axios.patch(`/api/loans/${loanId}/refuse`);
    fetchLoans();
  };
  const handleReturn = async (loanId) => {
    await axios.patch(`/api/loans/${loanId}/return`);
    fetchLoans();
  };
  const handleCancel = async (loanId) => {
    await axios.patch(`/api/loans/${loanId}/cancel`);
    fetchLoans();
  };
  const handleSold = async (listingId) => {
    await axios.put(`/api/listings/${listingId}`, { status: 'sold' });
    fetchLoans();
  };

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', py: { xs: 2, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 4, color: '#222', letterSpacing: -0.5 }}>
          Loans
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={8}>
            <CircularProgress sx={{ color: '#4a1d3f' }} />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={8}>
            <Typography color="error" variant="h6" sx={{ fontWeight: 600 }}>
              {error}
            </Typography>
          </Box>
        ) : (
          <>
            <Box mb={6}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#4a1d3f' }}>
                Loaned Out
              </Typography>
              {loansGiven.length === 0 ? (
                <Typography color="text.secondary">No items currently loaned out.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {loansGiven.map(loan => (
                    <Grid item xs={12} md={6} key={loan.loan_id}>
                      <LoanCard
                        loan={loan}
                        user={user}
                        onApprove={handleApprove}
                        onRefuse={handleRefuse}
                        onReturn={handleReturn}
                        onCancel={handleCancel}
                        onSold={handleSold}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
            <Box mb={6}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#4a1d3f' }}>
                On Loan to Me
              </Typography>
              {loansReceived.length === 0 ? (
                <Typography color="text.secondary">No items currently on loan to you.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {loansReceived.map(loan => (
                    <Grid item xs={12} md={6} key={loan.loan_id}>
                      <LoanCard
                        loan={loan}
                        user={user}
                        onApprove={handleApprove}
                        onRefuse={handleRefuse}
                        onReturn={handleReturn}
                        onCancel={handleCancel}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
} 