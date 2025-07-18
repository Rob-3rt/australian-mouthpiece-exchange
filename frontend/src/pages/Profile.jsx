import React, { useEffect, useState } from 'react';
import { Typography, Box, TextField, Button, Alert, CircularProgress, Rating, MenuItem, Grid, Card, CardContent, CardMedia, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Container, Snackbar, Autocomplete } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useForm } from 'react-hook-form';
import api from '../api/axios.js';
import { useAuth } from '../contexts/AuthContext';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LoanManagement from '../components/LoanManagement';

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

const INSTRUMENT_TYPES = [
  'Trumpet',
  'Piccolo Trumpet',
  'Flugelhorn',
  'Cornet',
  'Tenor Trombone',
  'Bass Trombone',
  'Alto Trombone',
  'Contrabass Trombone',
  'French Horn',
  'Tuba',
  'Sousaphone',
  'Euphonium',
  'Baritone Horn',
  'Wagner Tuba',
  'Ophicleide',
  'Alto Horn',
  'Mellophone'
];

const BRANDS = [
  'ACB (Austin Custom Brass)',
  'Alliance',
  'AR Resonance',
  'Bach (Vincent Bach)',
  'Best Brass',
  'Blessing (E.K. Blessing)',
  'Breslmair',
  'Bruno Tilz',
  'Curry',
  'Coppergate',
  'Denis Wick',
  'Donat',
  'Frate',
  'Frost',
  'Giddings & Webster',
  'Giardinelli',
  'Greg Black',
  'GR',
  'G.W. Mouthpieces',
  'Hammond Design',
  'Helix Brass',
  'Holton (Holton-Farkas)',
  'JC Custom',
  'Josef Klier',
  'King',
  'K&G',
  'La Tromba',
  'Laskey',
  'Legends Brass',
  'Lotus',
  'Marcinkiewicz',
  'Meeuwsen',
  'Monette',
  'O\'Malley',
  'Parduba',
  'Patrick',
  'Pickett',
  'Purviance',
  'Reeves',
  'Robert Tucci (formerly Perantucci)',
  'Rudy Mück',
  'Schilke',
  'Shires',
  'Stork',
  'Stomvi',
  'Toshi',
  'Vennture',
  'Warburton',
  'Wedge',
  'Yamaha'
];

const CONDITIONS = [
  'New',
  'Like New',
  'Excellent',
  'Very Good',
  'Good',
  'Fair',
  'Poor'
];

export default function Profile() {
  const { user, setError } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setErrorState] = useState(null);
  // Separate useForm for profile
  const { register: registerProfile, handleSubmit: handleProfileSubmit, reset: resetProfile } = useForm();
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showGuide, setShowGuide] = useState(true);
  const [paypalHelpOpen, setPaypalHelpOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/api/profile/me')
      .then(res => {
        setProfile(res.data);
        resetProfile(res.data); // Only for profile form
      })
      .catch(() => setErrorState('Failed to load profile.'))
      .finally(() => setLoading(false));
    // Fetch user's ratings
    setRatingsLoading(true);
    api.get(`/api/ratings/user/${user.user_id}`)
      .then(res => setRatings(res.data))
      .catch(() => setRatings([]))
      .finally(() => setRatingsLoading(false));

  }, [resetProfile, user.user_id]);



  // Profile form submit
  const onSubmit = async (data) => {
    setError(null); setSuccess(false);
    try {
      const res = await api.put('/api/profile/me', data);
      setProfile(res.data);
      setEditMode(false);
      setSuccess(true);
      setSnackbar({ open: true, message: 'Profile updated!', severity: 'success' });
    } catch (err) {
      setErrorState(err.response?.data?.error || 'Update failed');
      setSnackbar({ open: true, message: 'Update failed', severity: 'error' });
    }
  };





  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return null;

  return (
    <Box sx={{ 
      backgroundColor: '#ffffff', 
      minHeight: '100vh', 
      py: { xs: 4, md: 6 }
    }}>
      <Container maxWidth="md">
      {showGuide && (
        <Card sx={{ 
          mb: 4, 
          background: 'linear-gradient(135deg, #4a1d3f 0%, #3a162f 100%)',
          color: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(74, 29, 63, 0.15)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="start">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
                  Quick Start for Sellers
                </Typography>
                <ol style={{ marginLeft: 16, color: 'white' }}>
                  <li style={{ marginBottom: '8px' }}>
                    <b>Set up your profile:</b> Fill in your name, state, and (optionally) PayPal link.
                  </li>
                  <li>
                    <b>Create a listing:</b> Click <b>Add Listing</b> in the top bar, fill out the details, and publish.
                  </li>
                </ol>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setShowGuide(false)} 
                aria-label="Dismiss guide" 
                sx={{ 
                  ml: 2,
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      )}
      <Card sx={{ 
        borderRadius: '16px',
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e0d6e6',
        overflow: 'hidden',
        background: '#fff',
        mb: 4
      }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#2d133b', 
              mb: 3,
              letterSpacing: -0.5
            }}
          >
            My Profile
          </Typography>
          {success && <Alert severity="success" sx={{ mb: 2 }}>Profile updated!</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {!editMode ? (
            <Box>
              <Typography>Name: {profile.name}</Typography>
              <Typography>Nickname: {profile.nickname || '-'}</Typography>
              <Typography>Email: {profile.email}</Typography>
              <Typography>State: {profile.location_state}</Typography>
              <Typography>Postcode: {profile.location_postcode}</Typography>
              <Typography>PayPal: {profile.paypal_link || '-'} </Typography>
              <Box mt={2}>
                <Typography>Average Rating:</Typography>
                <Rating value={profile.average_rating || 0} precision={0.1} readOnly sx={{ color: '#ffd700' }} />
                <Typography variant="caption">({profile.rating_count || 0} ratings)</Typography>
              </Box>
              {profile.paypal_link && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  You have a PayPal.Me link set. Buyers can pay you directly via this link.
                </Alert>
              )}
              {!profile.paypal_link && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  You have not set a PayPal.Me link or email. Buyers will not be able to pay you directly. <a href="https://paypal.me" target="_blank" rel="noopener noreferrer">Create a PayPal.Me link</a>.
                </Alert>
              )}
              <Button variant="contained" sx={{ mt: 2, background: 'linear-gradient(90deg, #4a1d3f 60%, #7c3a7e 100%)', color: 'white', borderRadius: '8px', fontWeight: 600, textTransform: 'none', boxShadow: '0 2px 8px rgba(74,29,63,0.08)' }} onClick={() => setEditMode(true)}>Edit Profile</Button>
            </Box>
          ) : (
            <form onSubmit={handleProfileSubmit(onSubmit)}>
              <TextField label="Name" fullWidth margin="normal" {...registerProfile('name', { required: true })} />
              <TextField label="Nickname (optional)" fullWidth margin="normal" {...registerProfile('nickname')} />
              <TextField label="State" select fullWidth margin="normal" {...registerProfile('location_state', { required: true })}>
                {STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField label="Postcode" fullWidth margin="normal" {...registerProfile('location_postcode', { required: true })} />
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label={<span>PayPal Link or Email (for payments) <IconButton size="small" aria-label="PayPal help" sx={{ verticalAlign: 'middle', color: '#4a1d3f', ml: 0.5 }} onClick={() => setPaypalHelpOpen(true)}><InfoOutlinedIcon fontSize="small" /></IconButton></span>}
                  fullWidth
                  margin="normal"
                  {...registerProfile('paypal_link')}
                  helperText={
                    <span>
                      <a href="#" onClick={(e) => { e.preventDefault(); setPaypalHelpOpen(true); }} style={{ color: '#4a1d3f', textDecoration: 'underline', cursor: 'pointer' }}>
                        How to create a PayPal.Me link
                      </a>
                    </span>
                  }
                />
                <Dialog open={paypalHelpOpen} onClose={() => setPaypalHelpOpen(false)} maxWidth="xs" fullWidth>
                  <DialogTitle sx={{ background: 'linear-gradient(135deg, #4a1d3f 0%, #3a162f 100%)', color: 'white', fontWeight: 700 }}>How to create a PayPal.Me link</DialogTitle>
                  <DialogContent sx={{ pb: 0 }}>
                    <ol style={{ marginLeft: 16, marginTop: 8, marginBottom: 8 }}>
                      <li>Log in (or sign up) at <a href="https://paypal.com" target="_blank" rel="noopener noreferrer">paypal.com</a>.</li>
                      <li>Go to <a href="https://paypal.me" target="_blank" rel="noopener noreferrer">paypal.me</a> and click <b>"Create Your PayPal.Me Link"</b>.</li>
                      <li>Choose your handle (alphanumeric, up to 20 characters, no spaces/symbols). It's permanent.</li>
                      <li>Optionally add a photo, bio, or theme so buyers recognize you.</li>
                      <li>Accept the PayPal.Me Terms and hit <b>Confirm</b>.</li>
                      <li>Copy your link (e.g. <code style={{ backgroundColor: 'rgba(74,29,63,0.08)', padding: '2px 4px', borderRadius: '4px' }}>https://paypal.me/YourHandle</code>) and paste it into your profile's PayPal field.</li>
                    </ol>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <b>Note:</b> You do <u>not</u> have to provide a PayPal link. You can make direct arrangements with the buyer if you prefer.
                    </Alert>
                  </DialogContent>
                  <DialogActions sx={{ pb: 2, pr: 3 }}>
                    <Button onClick={() => setPaypalHelpOpen(false)} variant="contained" sx={{ background: 'linear-gradient(90deg, #4a1d3f 60%, #7c3a7e 100%)', color: 'white', borderRadius: '8px', fontWeight: 600, textTransform: 'none' }}>Close</Button>
                  </DialogActions>
                </Dialog>
              </Box>
              <Button type="submit" variant="contained" sx={{ mt: 2, background: 'linear-gradient(90deg, #4a1d3f 60%, #7c3a7e 100%)', color: 'white', borderRadius: '8px', fontWeight: 600, textTransform: 'none', boxShadow: '0 2px 8px rgba(74,29,63,0.08)' }}>Save</Button>
              <Button variant="text" sx={{ mt: 2, ml: 2, color: '#4a1d3f', fontWeight: 600, textTransform: 'none' }} onClick={() => { setEditMode(false); resetProfile(profile); }}>Cancel</Button>
            </form>
          )}
        </CardContent>
      </Card>
      {/* My Loans Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>My Ratings</Typography>
        {ratingsLoading ? <CircularProgress /> : (
          ratings.length === 0 ? <Typography>No ratings yet.</Typography> : (
            <Grid container spacing={2}>
              {ratings.map(rating => (
                <Grid item xs={12} sm={12} key={rating.rating_id}>
                  <Card sx={{ borderRadius: '8px', border: '1px solid #e0d6e6' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Rating value={rating.stars} readOnly sx={{ color: '#ffd700' }} />
                        <Typography variant="body2">{rating.from_user.nickname || rating.from_user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(rating.timestamp).toLocaleDateString()}</Typography>
                      </Box>
                      <Typography variant="body1" sx={{ mt: 1 }}>{rating.comment}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )
        )}
      </Box>


      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
} 