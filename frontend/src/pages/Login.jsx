import React from 'react';
import { Typography, TextField, Button, Box, Alert, CircularProgress, Container, Card, CardContent } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login, error, loading, setError } = useAuth();
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError(null);
    const success = await login(data.email, data.password);
    if (success) navigate('/');
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
              Welcome back
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#717171',
                fontSize: '18px'
              }}
            >
              Sign in to your account
            </Typography>
          </Box>

          {/* Login Card */}
          <Card sx={{ 
            border: '1px solid #dddddd',
            borderRadius: '16px',
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
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
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  {...register('email', { required: true })}
                  sx={{
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
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  {...register('password', { required: true })}
                  sx={{
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
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ 
                    mt: 4,
                    mb: 3,
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
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign in'}
                </Button>
              </form>

              {/* Links */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2,
                    color: '#717171'
                  }}
                >
                  <Link 
                    to="/forgot-password" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#4a1d3f',
                      fontWeight: 600,
                      '&:hover': {
                        color: '#3a162f'
                      }
                    }}
                  >
                    Forgot your password?
                  </Link>
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#717171'
                  }}
                >
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#4a1d3f',
                      fontWeight: 600,
                      '&:hover': {
                        color: '#3a162f'
                      }
                    }}
                  >
                    Sign up
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