import React, { useEffect, useState } from 'react';
import { Typography, Box, Container, CircularProgress, Grid, Tabs, Tab, Box as MuiBox } from '@mui/material';
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
  const [tab, setTab] = useState('incoming');

  useEffect(() => {
    fetchLoans();
    // eslint-disable-next-line
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/loans/dashboard');
      setIncoming(response.data.incoming);
      setOutgoing(response.data.outgoing);
      setCurrent(response.data.current);
      setHistory(response.data.history);
    } catch (err) {
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
  const handleConfirmReturn = async (loanId) => {
    await axios.patch(`/api/loans/${loanId}/confirm_return`);
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
            <MuiBox sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={tab}
                onChange={(_, newValue) => setTab(newValue)}
                textColor="primary"
                indicatorColor="primary"
                aria-label="loan tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label={`Incoming Requests (${incoming.length})`} value="incoming" />
                <Tab label={`Outgoing Requests (${outgoing.length})`} value="outgoing" />
                <Tab label={`Borrowing (${loansBorrowing.length})`} value="borrowing" />
                <Tab label={`Lending (${loansLending.length})`} value="lending" />
                <Tab label={`History (${history.length})`} value="history" />
              </Tabs>
            </MuiBox>
            {tab === 'incoming' && (
              <Box mb={6}>
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
            )}
            {tab === 'outgoing' && (
              <Box mb={6}>
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
            )}
            {tab === 'borrowing' && (
              <Box mb={6}>
                {loansBorrowing.length === 0 ? (
                  <Typography color="text.secondary">No items you are borrowing.</Typography>
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
            )}
            {tab === 'lending' && (
              <Box mb={6}>
                {loansLending.length === 0 ? (
                  <Typography color="text.secondary">No items you are lending out.</Typography>
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
                          onConfirmReturn={handleConfirmReturn}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
            {tab === 'history' && (
              <Box mb={6}>
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
                          onRequestReturn={handleRequestReturn}
                          onConfirmReturn={handleConfirmReturn}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
} 