import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';

const LoanManagement = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLoans();
    fetchStats();
  }, [activeTab]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/loans?type=${activeTab}`);
      setLoans(response.data);
    } catch (err) {
      setError('Failed to fetch loans');
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/loans/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching loan stats:', err);
    }
  };

  const handleReturnLoan = async (loanId) => {
    try {
      await axios.patch(`/api/loans/${loanId}/return`);
      fetchLoans();
      fetchStats();
    } catch (err) {
      setError('Failed to return loan');
      console.error('Error returning loan:', err);
    }
  };

  const handleCancelLoan = async (loanId) => {
    if (!window.confirm('Are you sure you want to cancel this loan?')) {
      return;
    }
    
    try {
      await axios.patch(`/api/loans/${loanId}/cancel`);
      fetchLoans();
      fetchStats();
    } catch (err) {
      setError('Failed to cancel loan');
      console.error('Error cancelling loan:', err);
    }
  };

  const handleApproveLoan = async (loanId) => {
    try {
      await axios.patch(`/api/loans/${loanId}/approve`);
      fetchLoans();
      fetchStats();
    } catch (err) {
      setError('Failed to approve loan');
      console.error('Error approving loan:', err);
    }
  };

  const handleRefuseLoan = async (loanId) => {
    if (!window.confirm('Are you sure you want to refuse this loan request?')) {
      return;
    }
    try {
      await axios.patch(`/api/loans/${loanId}/refuse`);
      fetchLoans();
      fetchStats();
    } catch (err) {
      setError('Failed to refuse loan');
      console.error('Error refusing loan:', err);
    }
  };

  const getStatusBadge = (status, expectedReturn) => {
    const isOverdue = status === 'active' && new Date(expectedReturn) < new Date();
    if (isOverdue) {
      return <span className="badge bg-danger">Overdue</span>;
    }
    switch (status) {
      case 'pending':
        return <span className="badge bg-info text-dark">Pending</span>;
      case 'refused':
        return <span className="badge bg-danger">Refused</span>;
      case 'active':
        return <span className="badge bg-success">Active</span>;
      case 'returned':
        return <span className="badge bg-secondary">Returned</span>;
      case 'cancelled':
        return <span className="badge bg-warning">Cancelled</span>;
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="text-center p-4">Loading loans...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Loan Management</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">{stats.loansGiven || 0}</h5>
              <p className="card-text">Loans Given</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">{stats.activeLoansGiven || 0}</h5>
              <p className="card-text">Active Given</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">{stats.loansReceived || 0}</h5>
              <p className="card-text">Loans Received</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">{stats.activeLoansReceived || 0}</h5>
              <p className="card-text">Active Received</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-danger">{stats.overdueLoans || 0}</h5>
              <p className="card-text">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Loans
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'given' ? 'active' : ''}`}
            onClick={() => setActiveTab('given')}
          >
            Loans Given
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Loans Received
          </button>
        </li>
      </ul>

      {/* Loans List */}
      {loans.length === 0 ? (
        <div className="text-center p-4">
          <p>No loans found.</p>
        </div>
      ) : (
        <div className="row">
          {loans.map((loan) => (
            <div key={loan.loan_id} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    {loan.listing.instrument_type} - {loan.listing.brand} {loan.listing.model}
                  </h6>
                  {getStatusBadge(loan.status, loan.expected_return_date)}
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">Lender:</small>
                      <p className="mb-1">{loan.lender.name}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Borrower:</small>
                      <p className="mb-1">{loan.borrower.name}</p>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">Start Date:</small>
                      <p className="mb-1">{formatDate(loan.start_date)}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Expected Return:</small>
                      <p className="mb-1">{formatDate(loan.expected_return_date)}</p>
                    </div>
                  </div>

                  {loan.actual_return_date && (
                    <div className="row">
                      <div className="col-6">
                        <small className="text-muted">Actual Return:</small>
                        <p className="mb-1">{formatDate(loan.actual_return_date)}</p>
                      </div>
                    </div>
                  )}

                  {loan.notes && (
                    <div className="mt-2">
                      <small className="text-muted">Notes:</small>
                      <p className="mb-1">{loan.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-3">
                    {loan.status === 'pending' && loan.lender_id === user?.userId && (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleApproveLoan(loan.loan_id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRefuseLoan(loan.loan_id)}
                        >
                          Refuse
                        </button>
                      </>
                    )}
                    {loan.status === 'active' && (
                      <>
                        {loan.borrower_id === user?.userId && (
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleReturnLoan(loan.loan_id)}
                          >
                            Mark as Returned
                          </button>
                        )}
                        {loan.lender_id === user?.userId && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleCancelLoan(loan.loan_id)}
                          >
                            Cancel Loan
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanManagement; 