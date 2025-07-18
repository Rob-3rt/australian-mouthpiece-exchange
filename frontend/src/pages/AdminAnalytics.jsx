import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

const AdminAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/admin/analytics/summary');
        setSummary(res.data);
      } catch (err) {
        setError('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading analytics...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!summary) return null;

  return (
    <div className="container mt-4">
      <h2>Admin Analytics</h2>
      <div className="row mt-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Users</h5>
              <p>Total: {summary.users.total}</p>
              <p>Verified: {summary.users.verified}</p>
              <p>Admins: {summary.users.admin}</p>
              <p>New (7d): {summary.users.newLast7Days}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Listings</h5>
              <p>Total: {summary.listings.total}</p>
              <p>Active: {summary.listings.active}</p>
              <p>Sold: {summary.listings.sold}</p>
              <p>Loaned: {summary.listings.loaned}</p>
              <p>Deleted: {summary.listings.deleted}</p>
              <p>New (7d): {summary.listings.newLast7Days}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Sales</h5>
              <p>Total: {summary.sales.total}</p>
              <p>New (7d): {summary.sales.newLast7Days}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Loans</h5>
              <p>Total: {summary.loans.total}</p>
              <p>Active: {summary.loans.active}</p>
              <p>Returned: {summary.loans.returned}</p>
              <p>Overdue: {summary.loans.overdue}</p>
              <p>New (7d): {summary.loans.newLast7Days}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Messages</h5>
              <p>Total: {summary.messages.total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 