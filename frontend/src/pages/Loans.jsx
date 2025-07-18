import React, { useEffect, useState } from 'react';
import { Typography, Box, Container, CircularProgress, Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import LoanCard from '../components/LoanCard';

export default function Loans() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [current, setCurrent] = useState([]);
  const [history, setHistory] = useState([]);
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
      const [incomingRes, outgoingRes, currentRes, historyRes] = await Promise.all([
        axios.get('/api/loans/incoming').then(res => { console.log('Incoming loans response:', res); return res; }),
        axios.get('/api/loans/outgoing').then(res => { console.log('Outgoing loans response:', res); return res; }),
        axios.get('/api/loans/current').then(res => { console.log('Current loans response:', res); return res; }),
        axios.get('/api/loans/history').then(res => { console.log('Loan history response:', res); return res; })
      ]);
      setIncoming(incomingRes.data);
      setOutgoing(outgoingRes.data);
      setCurrent(currentRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Error fetching loans:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      }
      setError('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

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
  const handleRequestReturn = async (loanId) => {
    await axios.patch(`/api/loans/${loanId}/request_return`);
    fetchLoans();
  };

  const loansBorrowing = current.filter(loan => (user?.userId ?? user?.user_id) === loan.borrower.user_id);
  const loansLending = current.filter(loan => (user?.userId ?? user?.user_id) === loan.lender.user_id);

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
                Incoming Requests
              </Typography>
              {incoming.length === 0 ? (
                <Typography color="text.secondary">No incoming loan requests.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {incoming.map(loan => (
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
                Outgoing Requests
              </Typography>
              {outgoing.length === 0 ? (
                <Typography color="text.secondary">No outgoing loan requests.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {outgoing.map(loan => (
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
                Loans I'm Borrowing
              </Typography>
              {loansBorrowing.length === 0 ? (
                <Typography color="text.secondary">No current loans you are borrowing.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {loansBorrowing.map(loan => (
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
                Loans I've Lent Out
              </Typography>
              {loansLending.length === 0 ? (
                <Typography color="text.secondary">No current loans you are lending out.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {loansLending.map(loan => (
                    <Grid item xs={12} md={6} key={loan.loan_id}>
                      <LoanCard
                        loan={loan}
                        user={user}
                        onApprove={handleApprove}
                        onRefuse={handleRefuse}
                        onReturn={handleReturn}
                        onCancel={handleCancel}
                        onSold={handleSold}
                        onRequestReturn={handleRequestReturn}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
            <Box mb={6}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#4a1d3f' }}>
                Loan History
              </Typography>
              {history.length === 0 ? (
                <Typography color="text.secondary">No loan history.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {history.map(loan => (
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
          </>
        )}
      </Container>
    </Box>
  );
} 