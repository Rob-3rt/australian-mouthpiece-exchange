import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Alert, Card, CardContent, InputAdornment, IconButton } from '@mui/material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../api/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        newPassword: formData.newPassword
      });
      setMessage(response.data.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
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
            <Card sx={{ 
              border: '1px solid #dddddd',
              borderRadius: '16px',
              boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
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
                <Box sx={{ textAlign: 'center' }}>
                  <Button 
                    component={Link} 
                    to="/forgot-password" 
                    variant="contained"
                    sx={{ 
                      backgroundColor: '#4a1d3f',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '16px',
                      textTransform: 'none',
                      borderRadius: '8px',
                      py: 1.5,
                      px: 3,
                      boxShadow: 'none',
                      '&:hover': { 
                        backgroundColor: '#3a162f',
                        boxShadow: '0 2px 8px rgba(74, 29, 63, 0.3)'
                      }
                    }}
                  >
                    Request New Reset Link
                  </Button>
                </Box>
              </CardContent>
            </Card>
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
              Create new password
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#717171',
                fontSize: '18px'
              }}
            >
              Enter your new password below
            </Typography>
          </Box>

          {/* Reset Password Card */}
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
                  <br />
                  Redirecting to login page...
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
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  sx={{ 
                    mb: 3,
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#717171' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: '#717171' }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
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
                  {loading ? 'Resetting...' : 'Reset password'}
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