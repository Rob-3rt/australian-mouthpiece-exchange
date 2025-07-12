import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Alert, Card, CardContent } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      setMessage(response.data.message);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              Reset your password
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#717171',
                fontSize: '18px'
              }}
            >
              Enter your email address and we'll send you a link to reset your password
            </Typography>
          </Box>

          {/* Forgot Password Card */}
          <Card sx={{ 
            border: '1px solid #dddddd',
            borderRadius: '16px',
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              {message && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3,
                    borderRadius: '8px',
                    '& .MuiAlert-message': { fontWeight: 500 }
                  }}
                >
                  {message}
                </Alert>
              )}

              {error && (
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
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{ 
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: '#dddddd',
                      },
                      '&:hover fieldset': {
                        borderColor: '#222222',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#222222',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#717171',
                      '&.Mui-focused': {
                        color: '#222222',
                      },
                    },
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ 
                    backgroundColor: '#4a1d3f',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '16px',
                    textTransform: 'none',
                    borderRadius: '8px',
                    py: 1.5,
                    boxShadow: 'none',
                    '&:hover': { 
                      backgroundColor: '#3a162f',
                      boxShadow: '0 2px 8px rgba(74, 29, 63, 0.3)'
                    },
                    '&:disabled': {
                      backgroundColor: '#dddddd',
                      color: '#717171'
                    }
                  }}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>
              </Box>

              {/* Back to login link */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#717171'
                  }}
                >
                  Remember your password?{' '}
                  <Link 
                    to="/login" 
                    style={{ 
                      textDecoration: 'none', 
                                          color: '#4a1d3f',
                    fontWeight: 600,
                    '&:hover': {
                      color: '#3a162f'
                    }
                    }}
                  >
                    Back to sign in
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
} 