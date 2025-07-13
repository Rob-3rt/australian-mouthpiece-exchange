import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Alert, CircularProgress, MenuItem, FormControlLabel, Checkbox, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Container } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const STATES = [
  'NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'
];

export default function Register() {
  const { register: registerUser, error, loading, setError } = useAuth();
  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  // Clear any existing errors when component mounts
  React.useEffect(() => {
    setError(null);
  }, [setError]);

  const onSubmit = async (data) => {
    setError(null);
    
    if (!termsAccepted) {
      setError('You must accept the terms of use to register.');
      // Scroll to terms checkbox
      document.querySelector('input[type="checkbox"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    // Validate all fields first
    const isValid = await trigger();
    if (!isValid) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.Mui-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Debug: log the data being sent
    console.log('Registration data:', data);
    
    const ok = await registerUser(data);
    if (ok) {
      // Redirect to dedicated success page
      navigate('/registration-success');
    } else {
      // Scroll to error message
      document.querySelector('.MuiAlert-root')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <Box sx={{ 
      backgroundColor: '#ffffff', 
      minHeight: '100vh', 
      py: { xs: 4, md: 6 }
    }}>
      <Container maxWidth="md">
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
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
              Join The Australian Mouthpiece Exchange
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#717171',
                fontSize: '18px'
              }}
            >
              Create your account to start buying and selling
            </Typography>
          </Box>

          {/* Register Card */}
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
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                  <TextField
                    label="First Name"
                    fullWidth
                    margin="normal"
                    {...register('first_name', { 
                      required: 'First name is required',
                      minLength: { value: 2, message: 'First name must be at least 2 characters' }
                    })}
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '& fieldset': {
                          borderColor: errors.first_name ? '#d32f2f' : '#dddddd',
                        },
                        '&:hover fieldset': {
                          borderColor: errors.first_name ? '#d32f2f' : '#222222',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: errors.first_name ? '#d32f2f' : '#222222',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: errors.first_name ? '#d32f2f' : '#717171',
                        '&.Mui-focused': {
                          color: errors.first_name ? '#d32f2f' : '#222222',
                        },
                      },
                    }}
                  />
                  <TextField
                    label="Last Name"
                    fullWidth
                    margin="normal"
                    {...register('last_name', { 
                      required: 'Last name is required',
                      minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                    })}
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '& fieldset': {
                          borderColor: errors.last_name ? '#d32f2f' : '#dddddd',
                        },
                        '&:hover fieldset': {
                          borderColor: errors.last_name ? '#d32f2f' : '#222222',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: errors.last_name ? '#d32f2f' : '#222222',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: errors.last_name ? '#d32f2f' : '#717171',
                        '&.Mui-focused': {
                          color: errors.last_name ? '#d32f2f' : '#222222',
                        },
                      },
                    }}
                  />
                </Box>
                
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: errors.email ? '#d32f2f' : '#dddddd',
                      },
                      '&:hover fieldset': {
                        borderColor: errors.email ? '#d32f2f' : '#222222',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: errors.email ? '#d32f2f' : '#222222',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: errors.email ? '#d32f2f' : '#717171',
                      '&.Mui-focused': {
                        color: errors.email ? '#d32f2f' : '#222222',
                      },
                    },
                  }}
                />
                
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: errors.password ? '#d32f2f' : '#dddddd',
                      },
                      '&:hover fieldset': {
                        borderColor: errors.password ? '#d32f2f' : '#222222',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: errors.password ? '#d32f2f' : '#222222',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: errors.password ? '#d32f2f' : '#717171',
                      '&.Mui-focused': {
                        color: errors.password ? '#d32f2f' : '#222222',
                      },
                    },
                  }}
                />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                  <TextField
                    label="State"
                    select
                    fullWidth
                    margin="normal"
                    {...register('location_state', { required: 'State is required' })}
                    error={!!errors.location_state}
                    helperText={errors.location_state?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '& fieldset': {
                          borderColor: errors.location_state ? '#d32f2f' : '#dddddd',
                        },
                        '&:hover fieldset': {
                          borderColor: errors.location_state ? '#d32f2f' : '#222222',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: errors.location_state ? '#d32f2f' : '#222222',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: errors.location_state ? '#d32f2f' : '#717171',
                        '&.Mui-focused': {
                          color: errors.location_state ? '#d32f2f' : '#222222',
                        },
                      },
                    }}
                  >
                    {STATES.map((state) => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Postcode"
                    fullWidth
                    margin="normal"
                    {...register('location_postcode', { 
                      required: 'Postcode is required',
                      pattern: {
                        value: /^\d{4}$/,
                        message: 'Please enter a valid 4-digit postcode'
                      }
                    })}
                    error={!!errors.location_postcode}
                    helperText={errors.location_postcode?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '& fieldset': {
                          borderColor: errors.location_postcode ? '#d32f2f' : '#dddddd',
                        },
                        '&:hover fieldset': {
                          borderColor: errors.location_postcode ? '#d32f2f' : '#222222',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: errors.location_postcode ? '#d32f2f' : '#222222',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: errors.location_postcode ? '#d32f2f' : '#717171',
                        '&.Mui-focused': {
                          color: errors.location_postcode ? '#d32f2f' : '#222222',
                        },
                      },
                    }}
                  />
                </Box>
                
                <TextField
                  label="Nickname (optional)"
                  fullWidth
                  margin="normal"
                  {...register('nickname')}
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
                
                {/* Terms of Use */}
                <Box sx={{ mt: 4, mb: 3 }}>
                  <Accordion sx={{ 
                    border: '1px solid #dddddd',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    '&:before': { display: 'none' }
                  }}>
                    <AccordionSummary 
                      expandIcon={<ExpandMoreIcon sx={{ color: '#4a1d3f' }} />}
                      sx={{
                        '& .MuiAccordionSummary-content': {
                          margin: '12px 0'
                        }
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#4a1d3f',
                          fontWeight: 600
                        }}
                      >
                        ⚠️ Terms of Use & Disclaimer
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Card variant="outlined" sx={{ 
                        mb: 2,
                        border: '1px solid #dddddd',
                        borderRadius: '8px'
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#222222' }}>
                            Disclaimer & Seller Information
                          </Typography>
                          <Typography variant="body2" paragraph sx={{ color: '#717171', lineHeight: 1.6 }}>
                            This platform is a marketplace that allows individuals to advertise and sell mouthpieces directly to buyers, similar to Facebook Marketplace. We do not process payments or handle shipping.
                          </Typography>
                          
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ color: '#222222' }}>
                            Key Information:
                          </Typography>
                          
                          <Typography variant="body2" component="div" sx={{ mb: 1, color: '#717171' }}>
                            <strong>Payments:</strong> All transactions are handled off-site. Sellers may provide a PayPal link or arrange alternative payment methods directly with buyers.
                          </Typography>
                          
                          <Typography variant="body2" component="div" sx={{ mb: 1, color: '#717171' }}>
                            <strong>Shipping:</strong> The listed price does not include shipping. Buyers and sellers must arrange shipping details and costs between themselves.
                          </Typography>
                          
                          <Typography variant="body2" component="div" sx={{ mb: 1, color: '#717171' }}>
                            <strong>Responsibility:</strong> This website does not act as an intermediary in transactions. Any disputes, including but not limited to payment issues, chargebacks, or non-delivery, are solely between the buyer and seller.
                          </Typography>
                          
                          <Typography variant="body2" component="div" sx={{ mb: 1, color: '#717171' }}>
                            <strong>Use at Your Own Risk:</strong> Buyers and sellers are encouraged to exercise caution and use secure, traceable payment and shipping methods.
                          </Typography>
                          
                          <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 2, color: '#717171' }}>
                            By using this platform, you agree that the website owner is not liable for any issues arising from sales, payments, or communication between parties.
                          </Typography>
                        </CardContent>
                      </Card>
                    </AccordionDetails>
                  </Accordion>
                </Box>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                      sx={{
                        color: '#4a1d3f',
                        '&.Mui-checked': {
                          color: '#4a1d3f',
                        },
                      }}
                    />
                  }
                  label="I have read and agree to the Terms of Use and Disclaimer"
                  sx={{ 
                    mb: 3,
                    '& .MuiFormControlLabel-label': {
                      color: '#717171',
                      fontSize: '14px'
                    }
                  }}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !termsAccepted || success}
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
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : success ? 'Registration Complete!' : 'Create account'}
                </Button>
              </form>

              {/* Sign in link */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#717171'
                  }}
                >
                  Already have an account?{' '}
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
                    Sign in
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