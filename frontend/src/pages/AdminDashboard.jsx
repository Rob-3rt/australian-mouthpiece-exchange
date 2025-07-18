import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Button,
  Container,
  Snackbar,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import api from '../api/axios.js';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminAnalytics from './AdminAnalytics';

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [flags, setFlags] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('flags'); // 'flags', 'users', 'analytics'
  const [editUserDialog, setEditUserDialog] = useState({ open: false, user: null });
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, flagsRes, usersRes] = await Promise.all([
        api.get('/api/moderation/dashboard'),
        api.get('/api/moderation/flags'),
        api.get('/api/admin/users')
      ]);
      setStats(statsRes.data);
      setFlags(flagsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setSnackbar({ open: true, message: 'Failed to load admin data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Admin actions
  const handleFlagStatus = async (flag_id, status) => {
    try {
      await api.patch(`/api/moderation/flags/${flag_id}`, { status });
      setSnackbar({ open: true, message: 'Flag status updated', severity: 'success' });
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update flag status', severity: 'error' });
    }
  };

  const handleDeleteFlag = async (flag_id) => {
    if (!window.confirm('Delete this flag?')) return;
    try {
      await api.delete(`/api/moderation/flags/${flag_id}`);
      setSnackbar({ open: true, message: 'Flag deleted', severity: 'success' });
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete flag', severity: 'error' });
    }
  };

  // User management functions
  const handleDeleteUser = async (userId) => {
    console.log('Attempting to delete user:', userId);
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      console.log('Sending delete request to:', `/api/admin/users/${userId}`);
      const response = await api.delete(`/api/admin/users/${userId}`);
      console.log('Delete response:', response);
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      fetchData();
    } catch (error) {
      console.error('Delete user error:', error);
      setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
    }
  };

  const handleEditUser = (user) => {
    setEditUserDialog({ open: true, user });
  };

  const handleSaveUser = async (updatedUser) => {
    try {
      await api.put(`/api/admin/users/${updatedUser.user_id}`, updatedUser);
      setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      setEditUserDialog({ open: false, user: null });
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update user', severity: 'error' });
    }
  };

  const handleToggleEmailVerification = async (userId, currentStatus) => {
    try {
      await api.patch(`/api/admin/users/${userId}/verify-email`, { 
        email_verified: !currentStatus 
      });
      setSnackbar({ 
        open: true, 
        message: `Email verification ${!currentStatus ? 'enabled' : 'disabled'}`, 
        severity: 'success' 
      });
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update email verification', severity: 'error' });
    }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    try {
      await api.patch(`/api/admin/users/${userId}/admin`, { 
        is_admin: !currentStatus 
      });
      setSnackbar({ 
        open: true, 
        message: `Admin status ${!currentStatus ? 'enabled' : 'disabled'}`, 
        severity: 'success' 
      });
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update admin status', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        backgroundColor: '#ffffff', 
        minHeight: '100vh', 
        py: { xs: 4, md: 6 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress sx={{ color: '#4a1d3f' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: '#ffffff', 
      minHeight: '100vh', 
      py: { xs: 4, md: 6 }
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              color: '#222222', 
              mb: 2,
              letterSpacing: -0.5
            }}
          >
            Admin Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant={activeTab === 'flags' ? 'contained' : 'outlined'} onClick={() => setActiveTab('flags')}>Flags</Button>
            <Button variant={activeTab === 'users' ? 'contained' : 'outlined'} onClick={() => setActiveTab('users')}>Users</Button>
            <Button variant={activeTab === 'analytics' ? 'contained' : 'outlined'} onClick={() => setActiveTab('analytics')}>Analytics</Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                border: '1px solid #dddddd',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-2px)', 
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FlagIcon sx={{ mr: 2, color: '#ff9800' }} />
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#222222'
                      }}
                    >
                      {stats.pendingFlags}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#717171',
                      fontWeight: 500
                    }}
                  >
                    Pending Flags
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                border: '1px solid #dddddd',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-2px)', 
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#4a1d3f',
                      mb: 2
                    }}
                  >
                    {flags.length}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#717171',
                      fontWeight: 500
                    }}
                  >
                    Total Flagged Listings
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ 
                border: '1px solid #dddddd',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-2px)', 
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#4caf50',
                      mb: 2
                    }}
                  >
                    {flags.filter(f => f.status === 'resolved').length}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#717171',
                      fontWeight: 500
                    }}
                  >
                    Resolved Flags
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tab Navigation */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: '#dddddd' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={() => setActiveTab('flags')}
                sx={{
                  color: activeTab === 'flags' ? '#4a1d3f' : '#717171',
                  borderBottom: activeTab === 'flags' ? '2px solid #4a1d3f' : '2px solid transparent',
                  borderRadius: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '16px',
                  py: 2,
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#4a1d3f'
                  }
                }}
                startIcon={<FlagIcon />}
              >
                Flagged Content
              </Button>
              <Button
                onClick={() => setActiveTab('users')}
                sx={{
                  color: activeTab === 'users' ? '#4a1d3f' : '#717171',
                  borderBottom: activeTab === 'users' ? '2px solid #4a1d3f' : '2px solid transparent',
                  borderRadius: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '16px',
                  py: 2,
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#4a1d3f'
                  }
                }}
                startIcon={<PersonIcon />}
              >
                User Management
              </Button>
              <Button
                onClick={() => setActiveTab('analytics')}
                sx={{
                  color: activeTab === 'analytics' ? '#4a1d3f' : '#717171',
                  borderBottom: activeTab === 'analytics' ? '2px solid #4a1d3f' : '2px solid transparent',
                  borderRadius: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '16px',
                  py: 2,
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#4a1d3f'
                  }
                }}
                startIcon={<FlagIcon />}
              >
                Analytics
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Content based on active tab */}
        {activeTab === 'flags' && (
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: '#222222',
                mb: 3
              }}
            >
              Flagged Listings
            </Typography>
          
          {flags.length === 0 ? (
            <Card sx={{ 
              border: '1px solid #dddddd',
              borderRadius: '16px',
              boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ 
                p: { xs: 4, md: 6 },
                textAlign: 'center'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#717171',
                    mb: 2
                  }}
                >
                  No flagged listings
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#717171'
                  }}
                >
                  All content is currently compliant
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {flags.map(flag => (
                <Grid item xs={12} key={flag.flag_id}>
                  <Card sx={{ 
                    border: '1px solid #dddddd',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { 
                      transform: 'translateY(-2px)', 
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              color: '#222222',
                              mb: 1
                            }}
                          >
                            Listing #{flag.content_id}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#717171',
                              mb: 1
                            }}
                          >
                            <strong>Reason:</strong> {flag.reason}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#717171',
                              mb: 1
                            }}
                          >
                            <strong>Reported by:</strong> {flag.reporter?.name || 'Unknown'}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#717171',
                              fontSize: '12px'
                            }}
                          >
                            {new Date(flag.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip
                            label={flag.status}
                            color={getStatusColor(flag.status)}
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              textTransform: 'capitalize'
                            }}
                          />
                          {flag.status === 'pending' && (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() => handleFlagStatus(flag.flag_id, 'resolved')}
                                sx={{ 
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  borderRadius: '8px'
                                }}
                              >
                                Resolve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="info"
                                onClick={() => handleFlagStatus(flag.flag_id, 'reviewed')}
                                sx={{ 
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  borderRadius: '8px'
                                }}
                              >
                                Review
                              </Button>
                            </>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteFlag(flag.flag_id)}
                            sx={{ 
                              textTransform: 'none',
                              fontWeight: 600,
                              borderRadius: '8px'
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: '#222222',
                mb: 3
              }}
            >
              User Management
            </Typography>
            
            {users.length === 0 ? (
              <Card sx={{ 
                border: '1px solid #dddddd',
                borderRadius: '16px',
                boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden'
              }}>
                <CardContent sx={{ 
                  p: { xs: 4, md: 6 },
                  textAlign: 'center'
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#717171',
                      mb: 2
                    }}
                  >
                    No users found
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#717171'
                    }}
                  >
                    No users have been registered yet
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <TableContainer component={Paper} sx={{ 
                borderRadius: '12px',
                border: '1px solid #dddddd',
                overflow: 'hidden'
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                      <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Verified</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Admin</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.user_id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {user.name}
                            </Typography>
                            {user.nickname && (
                              <Typography variant="caption" sx={{ color: '#717171' }}>
                                @{user.nickname}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.location_state}, {user.location_postcode}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status}
                            color={user.status === 'active' ? 'success' : 'default'}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleToggleEmailVerification(user.user_id, user.email_verified)}
                            size="small"
                            sx={{ color: user.email_verified ? '#4caf50' : '#f44336' }}
                          >
                            {user.email_verified ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={`Click to ${user.is_admin ? 'remove' : 'grant'} admin status`}>
                            <Chip
                              label={user.is_admin ? 'Admin' : 'User'}
                              color={user.is_admin ? 'primary' : 'default'}
                              size="small"
                              onClick={() => handleToggleAdmin(user.user_id, user.is_admin)}
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': {
                                  opacity: 0.8
                                }
                              }}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              onClick={() => handleEditUser(user)}
                              size="small"
                              sx={{ color: '#4a1d3f' }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                console.log('Delete button clicked for user:', user.user_id);
                                handleDeleteUser(user.user_id);
                              }}
                              size="small"
                              sx={{ color: '#f44336' }}
                              disabled={(() => {
                                console.log('Checking delete button disabled state:');
                                console.log('  user.user_id:', user.user_id);
                                console.log('  currentUser?.user_id:', currentUser?.user_id);
                                console.log('  currentUser:', currentUser);
                                return user.user_id === currentUser?.user_id;
                              })()} // Can't delete yourself
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AdminAnalytics />
        )}

        {/* Edit User Dialog */}
        <Dialog 
          open={editUserDialog.open} 
          onClose={() => setEditUserDialog({ open: false, user: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            Edit User: {editUserDialog.user?.name}
          </DialogTitle>
          <DialogContent>
            {editUserDialog.user && (
              <Box sx={{ pt: 1 }}>
                <TextField
                  fullWidth
                  label="Name"
                  defaultValue={editUserDialog.user.name}
                  margin="normal"
                  onChange={(e) => setEditUserDialog({
                    ...editUserDialog,
                    user: { ...editUserDialog.user, name: e.target.value }
                  })}
                />
                <TextField
                  fullWidth
                  label="Nickname"
                  defaultValue={editUserDialog.user.nickname || ''}
                  margin="normal"
                  onChange={(e) => setEditUserDialog({
                    ...editUserDialog,
                    user: { ...editUserDialog.user, nickname: e.target.value }
                  })}
                />
                <TextField
                  fullWidth
                  label="Location State"
                  defaultValue={editUserDialog.user.location_state}
                  margin="normal"
                  select
                  onChange={(e) => setEditUserDialog({
                    ...editUserDialog,
                    user: { ...editUserDialog.user, location_state: e.target.value }
                  })}
                >
                  {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map((state) => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Location Postcode"
                  defaultValue={editUserDialog.user.location_postcode}
                  margin="normal"
                  onChange={(e) => setEditUserDialog({
                    ...editUserDialog,
                    user: { ...editUserDialog.user, location_postcode: e.target.value }
                  })}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setEditUserDialog({ open: false, user: null })}
              sx={{ color: '#717171' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleSaveUser(editUserDialog.user)}
              variant="contained"
              sx={{ 
                backgroundColor: '#4a1d3f',
                '&:hover': { backgroundColor: '#3a162f' }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity} 
            sx={{ 
              width: '100%',
              borderRadius: '8px',
              '& .MuiAlert-message': { fontWeight: 500 }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
} 