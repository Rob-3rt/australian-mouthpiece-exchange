import React from 'react';
import { Container, Box, Typography, Alert, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';

export default function RegistrationSuccess() {
  return (
    <Box sx={{ 
      backgroundColor: '#ffffff', 
      minHeight: '100vh', 
      py: { xs: 4, md: 8 },
      display: 'flex',
      alignItems: 'center'
    }}>
      <Container maxWidth="sm">
        <Box sx={{ maxWidth: 500, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: '#222222', 
                mb: 2,
                letterSpacing: -0.5
              }}
            >
              Registration Successful!
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#717171',
                fontSize: '18px'
              }}
            >
              Your account has been created successfully
            </Typography>
          </Box>

          {/* Success Card */}
          <Card sx={{ 
            border: '1px solid #dddddd',
            borderRadius: '16px',
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  borderRadius: '8px',
                  '& .MuiAlert-message': { fontWeight: 500 }
                }}
              >
                Please check your email to verify your account before logging in.
              </Alert>
              
              <Box sx={{ 
                p: 3, 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                mb: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 1, color: '#4a1d3f' }} />
                  <Typography variant="h6" sx={{ color: '#222222', fontWeight: 600 }}>
                    Email Verification Required
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 3, color: '#717171' }}>
                  To complete your registration and start using The Australian Mouthpiece Exchange, 
                  you need to verify your email address.
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 2, color: '#222222', fontWeight: 600 }}>
                  Next Steps:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1, color: '#717171' }}>
                    Check your email inbox (and spam folder)
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1, color: '#717171' }}>
                    Click the verification link in the email
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1, color: '#717171' }}>
                    Return here to log in once verified
                  </Typography>
                </Box>
                
                <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
                  <Typography variant="body2">
                    <strong>Can't find the email?</strong> Check your spam folder or wait a few minutes. 
                    If you still don't receive it, you can try registering again.
                  </Typography>
                </Alert>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  sx={{ 
                    backgroundColor: '#4a1d3f',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '14px',
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
                <Button
                  component={Link}
                  to="/register"
                  variant="outlined"
                  sx={{ 
                    borderColor: '#4a1d3f',
                    color: '#4a1d3f',
                    fontWeight: 600,
                    fontSize: '14px',
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
              </Box>
            </CardContent>
          </Card>
          
          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" sx={{ color: '#717171' }}>
              Need help? Contact support or check our FAQ
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 