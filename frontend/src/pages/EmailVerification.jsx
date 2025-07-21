import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Alert, Card, CardContent, CircularProgress, Button } from '@mui/material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import api from '../api/axios';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid verification link. Please check your email for the correct link.');
      setLoading(false);
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await api.get(`/api/auth/verify-email?token=${token}`);
      setMessage(response.data.message);
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Email verification failed. Please try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        backgroundColor: '#ffffff', 
        minHeight: '100vh', 
        py: { xs: 4, md: 8 },
        display: 'flex',
        alignItems: 'center'
      }}>
        <Container maxWidth="sm">
          <Box sx={{ maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#4a1d3f', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#717171' }}>
              Verifying your email...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: '#ffffff', 
      minHeight: '100vh', 
      py: { xs: 4, md: 8 },
      display: 'flex',
      alignItems: 'center'
    }}>
      <Container maxWidth="sm">
        <Box sx={{ maxWidth: 400, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: '#222222', 
                mb: 2,
                letterSpacing: -0.5
              }}
            >
              Email Verification
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#717171',
                fontSize: '18px'
              }}
            >
              {isSuccess ? 'Your email has been verified!' : 'Verification Status'}
            </Typography>
          </Box>

          {/* Verification Card */}
          <Card sx={{ 
            border: '1px solid #dddddd',
            borderRadius: '16px',
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
              {isSuccess ? (
                <>
                  <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 3,
                      borderRadius: '8px',
                      '& .MuiAlert-message': { fontWeight: 500 }
                    }}
                  >
                    {message === 'Email already verified.' 
                      ? 'Your email was already verified successfully! You can now log in to your account.'
                      : message
                    }
                  </Alert>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#717171',
                      mb: 3
                    }}
                  >
                    You can now log in to your account and start using The Australian Mouthpiece Exchange.
                  </Typography>
                  <Button
                    component={Link}
                    to="/login"
                    variant="contained"
                    sx={{ 
                      backgroundColor: '#4a1d3f',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '16px',
                      textTransform: 'none',
                      borderRadius: '8px',
                      py: 1.5,
                      px: 4,
                      boxShadow: 'none',
                      '&:hover': { 
                        backgroundColor: '#3a162f',
                        boxShadow: '0 2px 8px rgba(74, 29, 63, 0.3)'
                      }
                    }}
                  >
                    Go to Login
                  </Button>
                </>
              ) : (
                <>
                  <ErrorIcon sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: '8px',
                      '& .MuiAlert-message': { fontWeight: 500 }
                    }}
                  >
                    {error}
                  </Alert>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#717171',
                      mb: 3
                    }}
                  >
                    If you're having trouble verifying your email, please contact support or try registering again.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      component={Link}
                      to="/register"
                      variant="outlined"
                      sx={{ 
                        borderColor: '#4a1d3f',
                        color: '#4a1d3f',
                        fontWeight: 600,
                        fontSize: '16px',
                        textTransform: 'none',
                        borderRadius: '8px',
                        py: 1.5,
                        px: 4,
                        '&:hover': { 
                          borderColor: '#3a162f',
                          backgroundColor: 'rgba(74, 29, 63, 0.04)'
                        }
                      }}
                    >
                      Register Again
                    </Button>
                    <Button
                      component={Link}
                      to="/login"
                      variant="contained"
                      sx={{ 
                        backgroundColor: '#4a1d3f',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '16px',
                        textTransform: 'none',
                        borderRadius: '8px',
                        py: 1.5,
                        px: 4,
                        boxShadow: 'none',
                        '&:hover': { 
                          backgroundColor: '#3a162f',
                          boxShadow: '0 2px 8px rgba(74, 29, 63, 0.3)'
                        }
                      }}
                    >
                      Go to Login
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
} 