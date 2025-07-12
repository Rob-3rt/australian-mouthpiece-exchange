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
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import api from '../api/axios.js';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, flagsRes] = await Promise.all([
        api.get('/api/moderation/dashboard'),
        api.get('/api/moderation/flags')
      ]);
      setStats(statsRes.data);
      setFlags(flagsRes.data);
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
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#717171',
              fontSize: '18px'
            }}
          >
            Manage flagged content and moderate the platform
          </Typography>
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

        {/* Flagged Listings */}
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