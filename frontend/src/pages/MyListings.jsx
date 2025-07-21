import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  CircularProgress, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  IconButton, 
  Button, 
  Container, 
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Autocomplete,
  Tabs,
  Tab,
  Box as MuiBox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useForm } from 'react-hook-form';
import api from '../api/axios.js';
import { useAuth } from '../contexts/AuthContext';
import CreateListingModal from '../components/CreateListingModal';

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
  'Tenor Horn',
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

export default function MyListings() {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [tab, setTab] = useState('active');

  const { reset, setValue } = useForm({
    defaultValues: {
      instrument_type: '',
      brand: '',
      model: '',
      condition: '',
      price: '',
      description: '',
      photos: [],
      open_to_swap: 'false'
    }
  });

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/listings?user_id=me');
      console.log('API Response:', res.data);
      // Handle the response structure correctly
      const listings = res.data.listings || res.data || [];
      console.log('Processed listings:', listings);
      console.log('Listings by status:', {
        active: listings.filter(l => l.status === 'active').length,
        paused: listings.filter(l => l.status === 'paused').length,
        sold: listings.filter(l => l.status === 'sold').length
      });
      setMyListings(Array.isArray(listings) ? listings : []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      setMyListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (listing = null) => {
    setEditingListing(listing);
    if (listing) {
      // Populate form with existing listing data
      setValue('instrument_type', listing.instrument_type);
      setValue('brand', listing.brand);
      setValue('model', listing.model);
      setValue('condition', listing.condition);
      setValue('price', listing.price);
      setValue('description', listing.description);
      setValue('open_to_swap', listing.open_to_swap ? 'true' : 'false');
      setSelectedImages((listing.photos || []).map(url => ({ preview: url, file: null })));
    } else {
      reset();
      setSelectedImages([]);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingListing(null);
    reset();
    setSelectedImages([]);
  };

  const validateImageFiles = (files) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return files.filter(file => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        console.warn(`Rejected file ${file.name}: Invalid file type ${file.type}`);
        return false;
      }
      
      // Check file size
      if (file.size > maxSize) {
        console.warn(`Rejected file ${file.name}: File too large (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        return false;
      }

      // Additional validation: check file extension matches MIME type
      const extension = file.name.split('.').pop().toLowerCase();
      const expectedExtensions = {
        'image/jpeg': ['jpg', 'jpeg'],
        'image/jpg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/gif': ['gif'],
        'image/webp': ['webp']
      };
      
      if (!expectedExtensions[file.type]?.includes(extension)) {
        console.warn(`Rejected file ${file.name}: Extension doesn't match MIME type`);
        return false;
      }

      return true;
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = validateImageFiles(files);
    if (validFiles.length !== files.length) {
      setSnackbar({ 
        open: true, 
        message: 'Some files were rejected. Only PNG, JPG, JPEG, GIF, and WebP images are allowed.', 
        severity: 'error' 
      });
    }
    const previews = await Promise.all(validFiles.map(async (file) => ({
      preview: URL.createObjectURL(file),
      file
    })));
    setSelectedImages(prev => [...prev, ...previews].slice(0, 6));
  };

  const handleRemoveImage = (idx) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== idx));
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let photos = [];
      if (selectedImages.length > 0) {
        const resizedPhotos = await Promise.all(selectedImages.map(async (img) => {
          if (img.file) {
            return await toBase64(img.file);
          } else {
            return img.preview;
          }
        }));
        photos = resizedPhotos;
      }

      const payload = {
        instrument_type: data.instrument_type,
        brand: data.brand,
        model: data.model,
        condition: data.condition,
        price: data.price,
        description: data.description,
        photos,
        open_to_swap: data.open_to_swap
      };

      if (editingListing) {
        await api.put(`/api/listings/${editingListing.listing_id}`, payload);
        setSnackbar({ open: true, message: 'Listing updated!', severity: 'success' });
      } else {
        await api.post('/api/listings', payload);
        setSnackbar({ open: true, message: 'Listing created!', severity: 'success' });
      }

      handleCloseModal();
      fetchMyListings();
    } catch (err) {
      console.error('Listing save error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to save listing.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePauseToggle = async (listing) => {
    try {
      console.log('Pausing listing:', listing.listing_id, 'Current status:', listing.status);
      const response = await api.patch(`/api/listings/${listing.listing_id}/pause`);
      console.log('Pause response:', response.data);
      setSnackbar({ open: true, message: 'Listing status updated!', severity: 'success' });
      fetchMyListings();
    } catch (error) {
      console.error('Pause error:', error);
      setSnackbar({ open: true, message: 'Failed to update listing status.', severity: 'error' });
    }
  };

  const handleDelete = async (listing) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/api/listings/${listing.listing_id}`);
      setSnackbar({ open: true, message: 'Listing deleted.', severity: 'success' });
      fetchMyListings();
    } catch (err) {
      console.error('Delete listing error:', err);
      if (err.response) {
        console.error('Delete listing error response:', err.response);
      }
      setSnackbar({ open: true, message: 'Failed to delete listing.', severity: 'error' });
    }
  };

  const handleMarkAsSold = async (listing) => {
    if (!window.confirm('Are you sure you want to mark this listing as sold?')) return;
    try {
      console.log('Marking listing as sold:', listing.listing_id);
      const response = await api.put(`/api/listings/${listing.listing_id}`, { status: 'sold' });
      console.log('Mark as sold response:', response.data);
      setSnackbar({ open: true, message: 'Listing marked as sold!', severity: 'success' });
      fetchMyListings();
    } catch (error) {
      console.error('Mark as sold error:', error);
      setSnackbar({ open: true, message: 'Failed to mark listing as sold.', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Group listings by status
  const activeListings = myListings.filter(listing => listing.status === 'active');
  const pausedListings = myListings.filter(listing => listing.status === 'paused');
  const soldListings = myListings.filter(listing => listing.status === 'sold');

  const ListingSection = ({ title, listings, status, emptyMessage }) => (
    <Box mb={6}>
      <Typography variant="h4" sx={{
        color: status === 'active' ? '#ff385c' : status === 'paused' ? '#e67e22' : '#717171',
        fontWeight: 700,
        mb: 3,
        letterSpacing: -0.5
      }}>
        {title} <span style={{fontWeight:400, color:'#bbb'}}>({listings.length})</span>
      </Typography>
      {listings.length === 0 ? (
        <Box sx={{
          backgroundColor: '#f7f7f7',
          borderRadius: '16px',
          p: 5,
          textAlign: 'center',
          border: '1px solid #eee',
          color: '#717171',
          fontSize: '18px',
          fontWeight: 500
        }}>
          {emptyMessage}
        </Box>
      ) : (
        <Grid container spacing={4}>
          {listings.map(listing => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={listing.listing_id}>
              <Card sx={{
                border: status === 'paused' ? '2px solid #e67e22' : status === 'sold' ? '2px solid #bbb' : '1px solid #dddddd',
                borderRadius: '12px',
                overflow: 'hidden',
                opacity: status === 'sold' ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                  borderColor: '#222222',
                  transform: 'translateY(-2px)'
                },
                display: 'flex',
                flexDirection: 'column',
                minHeight: 340
              }}>
                <Box sx={{ position: 'relative', width: '100%', height: 200, backgroundColor: '#f7f7f7', overflow: 'hidden' }}>
                  {listing.photos && listing.photos.length > 0 ? (
                    <img
                      src={listing.photos[0]}
                      alt={listing.brand + ' ' + listing.model}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '16px' }}>No Image</Box>
                  )}
                </Box>
                <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#222', mb: 1, fontSize: '16px', lineHeight: 1.2 }}>
                      {listing.brand} {listing.model}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#717171', fontSize: '14px', mb: 1 }}>
                      {listing.instrument_type} • {listing.condition}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#222', mb: 1, fontSize: '18px' }}>
                      ${listing.price}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#717171', fontSize: '14px', mb: 1 }}>
                      Status: {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    </Typography>
                  </Box>
                  {status !== 'sold' && (
                    <Box mt={2} display="flex" gap={1}>
                      <IconButton size="small" onClick={() => handleOpenModal(listing)} title="Edit" sx={{ borderRadius: '8px', color: '#222' }}>
                        <EditIcon />
                      </IconButton>
                      {status === 'active' && (
                        <IconButton size="small" onClick={() => handlePauseToggle(listing)} title="Pause" sx={{ borderRadius: '8px', color: '#e67e22' }}>
                          <PauseIcon />
                        </IconButton>
                      )}
                      {status === 'paused' && (
                        <IconButton size="small" onClick={() => handlePauseToggle(listing)} title="Activate" sx={{ borderRadius: '8px', color: '#43a047' }}>
                          <PlayArrowIcon />
                        </IconButton>
                      )}
                      {status === 'active' && (
                        <IconButton size="small" onClick={() => handleMarkAsSold(listing)} title="Mark as Sold" sx={{ borderRadius: '8px', color: '#43a047' }}>
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={() => handleDelete(listing)} title="Delete" sx={{ borderRadius: '8px', color: '#ff385c' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', py: { xs: 2, md: 6 } }}>
      <Container maxWidth="lg">
        <Box display="flex" alignItems="center" mb={4}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#222', letterSpacing: -0.5 }}>
            My Listings
          </Typography>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={8}>
            <CircularProgress sx={{ color: '#4a1d3f' }} />
          </Box>
        ) : myListings.length === 0 ? (
          <Box sx={{
            backgroundColor: '#f7f7f7',
            borderRadius: '16px',
            p: 5,
            textAlign: 'center',
            border: '1px solid #eee',
            color: '#717171',
            fontSize: '18px',
            fontWeight: 500
          }}>
            You haven't created any listings yet.
          </Box>
        ) : (
          <>
            <MuiBox sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={tab}
                onChange={(_, newValue) => setTab(newValue)}
                textColor="primary"
                indicatorColor="primary"
                aria-label="listing tabs"
              >
                <Tab label={`Active (${activeListings.length})`} value="active" />
                <Tab label={`Paused (${pausedListings.length})`} value="paused" />
                <Tab label={`Sold (${soldListings.length})`} value="sold" />
              </Tabs>
            </MuiBox>
            {tab === 'active' && (
              <ListingSection 
                title="Active Listings" 
                listings={activeListings} 
                status="active"
                emptyMessage="No active listings. Create a new listing to get started!"
              />
            )}
            {tab === 'paused' && (
              <ListingSection 
                title="Paused Listings" 
                listings={pausedListings} 
                status="paused"
                emptyMessage="No paused listings."
              />
            )}
            {tab === 'sold' && (
              <ListingSection 
                title="Sold Listings" 
                listings={soldListings} 
                status="sold"
                emptyMessage="No sold listings."
              />
            )}
          </>
        )}
      </Container>

      {/* Removed Add Listing modal and button; use nav bar button instead */}

      <CreateListingModal
        open={modalOpen}
        onClose={handleCloseModal}
        listing={editingListing}
        isEdit={Boolean(editingListing)}
        onSuccess={fetchMyListings}
      />

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
    </Box>
  );
} 