import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Autocomplete, CircularProgress, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, useWatch } from 'react-hook-form';
import api from '../api/axios.js';
import { useAuth } from '../contexts/AuthContext';

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
const INSTRUMENT_TYPES = [
  'Trumpet', 'Piccolo Trumpet', 'Flugelhorn', 'Cornet', 'Tenor Trombone', 'Bass Trombone', 'Alto Trombone', 'Contrabass Trombone', 'French Horn', 'Tuba', 'Sousaphone', 'Euphonium', 'Baritone Horn', 'Wagner Tuba', 'Ophicleide', 'Alto Horn', 'Mellophone'
];
const BRANDS = [
  'ACB (Austin Custom Brass)', 'Alliance', 'AR Resonance', 'Bach (Vincent Bach)', 'Best Brass', 'Blessing (E.K. Blessing)', 'Breslmair', 'Bruno Tilz', 'Curry', 'Coppergate', 'Denis Wick', 'Donat', 'Frate', 'Frost', 'Giddings & Webster', 'Giardinelli', 'Greg Black', 'GR', 'G.W. Mouthpieces', 'Hammond Design', 'Helix Brass', 'Holton (Holton-Farkas)', 'JC Custom', 'Josef Klier', 'King', 'K&G', 'La Tromba', 'Laskey', 'Legends Brass', 'Lotus', 'Marcinkiewicz', 'Meeuwsen', 'Monette', 'O\'Malley', 'Parduba', 'Patrick', 'Pickett', 'Purviance', 'Reeves', 'Robert Tucci (formerly Perantucci)', 'Rudy Mück', 'Schilke', 'Shires', 'Stork', 'Stomvi', 'Toshi', 'Vennture', 'Warburton', 'Wedge', 'Yamaha'
];
const CONDITIONS = ['New', 'Like New', 'Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

export default function CreateListingModal({ open, onClose, onSuccess, listing = null, isEdit = false }) {
  const { user } = useAuth();
  const { register, handleSubmit, reset, setValue, control } = useForm({
    defaultValues: {
      instrument_type: '',
      brand: '',
      model: '',
      condition: '',
      price: '',
      description: '',
      photos: [],
      open_to_swap: 'false',
      open_to_loan: 'false'
    }
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sellerPaypal, setSellerPaypal] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (user) setSellerPaypal(user.paypal_link || '');
  }, [user]);

  // Pre-fill form when editing
  useEffect(() => {
    if (listing && isEdit) {
      setValue('instrument_type', listing.instrument_type);
      setValue('brand', listing.brand);
      setValue('model', listing.model);
      setValue('condition', listing.condition);
      setValue('price', listing.price);
      setValue('description', listing.description);
      setValue('open_to_swap', listing.open_to_swap ? 'true' : 'false');
      setValue('open_to_loan', listing.open_to_loan ? 'true' : 'false');
      setSelectedImages((listing.photos || []).map(url => ({ preview: url, file: null })));
    } else if (!listing && !isEdit) {
      reset();
      setSelectedImages([]);
    }
  }, [listing, isEdit, reset, setValue]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    await processFiles(files);
  };

  const processFiles = async (files) => {
    const previews = await Promise.all(files.map(async (file) => ({
      preview: URL.createObjectURL(file),
      file
    })));
    setSelectedImages(prev => [...prev, ...previews].slice(0, 6)); // max 6 images
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    await processFiles(files);
  };
  const handleRemoveImage = (idx) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== idx));
  };
  const handleMoveLeft = (idx) => {
    if (idx === 0) return;
    setSelectedImages(prev => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  };
  const handleMoveRight = (idx) => {
    if (idx === selectedImages.length - 1) return;
    setSelectedImages(prev => {
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
  };
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
  const handleListingFormSubmit = async (data) => {
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
        open_to_swap: data.open_to_swap,
        open_to_loan: data.open_to_loan
      };
      let res;
      if (isEdit && listing && listing.listing_id) {
        res = await api.put(`/api/listings/${listing.listing_id}`, payload);
        setSnackbar({ open: true, message: 'Listing updated!', severity: 'success' });
      } else {
        res = await api.post('/api/listings', payload);
        setSnackbar({ open: true, message: 'Listing created!', severity: 'success' });
      }
      if (onSuccess && res.data && res.data.listing_id) onSuccess(res.data.listing_id);
      reset();
      setSelectedImages([]);
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to save listing. Please check your image sizes (max 5MB each).';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const instrumentType = useWatch({ control, name: 'instrument_type' });
  const brand = useWatch({ control, name: 'brand' });
  const model = useWatch({ control, name: 'model' });
  const openToSwap = useWatch({ control, name: 'open_to_swap' });
  const openToLoan = useWatch({ control, name: 'open_to_loan' });

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 700, 
        color: '#222222',
        borderBottom: '1px solid #f0f0f0',
        pb: 2
      }}>
        {isEdit ? 'Edit Listing' : 'Create A New Mouthpiece Listing'}
      </DialogTitle>
      <DialogContent sx={{ position: 'relative' }}>
        {isSubmitting && (
          <Box position="absolute" top={0} left={0} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" bgcolor="rgba(255,255,255,0.7)" zIndex={10}>
            <CircularProgress />
          </Box>
        )}
        <form id="listing-form" onSubmit={handleSubmit(handleListingFormSubmit)}>
          {/* No PayPal field shown */}
          <Autocomplete
            freeSolo
            options={INSTRUMENT_TYPES}
            value={instrumentType || ''}
            onChange={(event, newValue) => setValue('instrument_type', newValue || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Instrument Type"
                margin="normal"
                required
                {...register('instrument_type', { required: true })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4a1d3f'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4a1d3f'
                    }
                  }
                }}
              />
            )}
            onInputChange={(event, newInputValue) => setValue('instrument_type', newInputValue || '')}
          />
          <Autocomplete
            freeSolo
            options={BRANDS}
            value={brand || ''}
            onChange={(event, newValue) => setValue('brand', newValue || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Mouthpiece Brand"
                margin="normal"
                required
                {...register('brand', { required: true })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4a1d3f'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4a1d3f'
                    }
                  }
                }}
              />
            )}
            onInputChange={(event, newInputValue) => setValue('brand', newInputValue || '')}
          />
          <TextField 
            label="Model / Size" 
            fullWidth 
            margin="normal" 
            value={model || ''}
            {...register('model', { required: true })}
            onChange={e => setValue('model', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4a1d3f'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4a1d3f'
                }
              }
            }}
          />
          <TextField 
            label="Condition" 
            select 
            fullWidth 
            margin="normal" 
            value={useWatch({ control, name: 'condition' }) || ''}
            {...register('condition', { required: true })}
            onChange={e => setValue('condition', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4a1d3f'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4a1d3f'
                }
              }
            }}
          >
            {CONDITIONS.map(condition => (
              <MenuItem key={condition} value={condition}>{condition}</MenuItem>
            ))}
          </TextField>
          <TextField 
            label="Price" 
            type="number" 
            fullWidth 
            margin="normal" 
            value={useWatch({ control, name: 'price' }) || ''}
            {...register('price', { required: true })}
            onChange={e => setValue('price', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4a1d3f'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4a1d3f'
                }
              }
            }}
          />
          <TextField 
            label="Description" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3} 
            value={useWatch({ control, name: 'description' }) || ''}
            {...register('description', { required: true })}
            onChange={e => setValue('description', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4a1d3f'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4a1d3f'
                }
              }
            }}
          />
          {/* Custom File Upload UI */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#717171', mb: 1, fontWeight: 500 }}>
              Photos (max 6)
            </Typography>
            <Box
              sx={{
                border: `2px dashed ${isDragOver ? '#4a1d3f' : '#dddddd'}`,
                borderRadius: '12px',
                p: 3,
                textAlign: 'center',
                backgroundColor: isDragOver ? '#f0f0f0' : '#fafafa',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#4a1d3f',
                  backgroundColor: '#f7f7f7'
                }
              }}
              onClick={() => document.getElementById('file-input').click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <AddIcon sx={{ fontSize: 32, color: '#717171' }} />
                <Typography variant="body1" sx={{ color: '#222222', fontWeight: 600 }}>
                  Click to upload photos
                </Typography>
                <Typography variant="body2" sx={{ color: '#717171' }}>
                  Drag and drop images here, or click to browse
                </Typography>
                <Typography variant="caption" sx={{ color: '#717171', mt: 1 }}>
                  PNG, JPG, JPEG up to 5MB each
                </Typography>
              </Box>
            </Box>
          </Box>
          {selectedImages.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ color: '#717171', mb: 2, fontWeight: 500 }}>
                Selected Photos ({selectedImages.length}/6)
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                {selectedImages.map((img, idx) => (
                  <Box key={idx} position="relative" sx={{ 
                    border: '2px solid #dddddd',
                    borderRadius: '12px',
                    p: 1,
                    backgroundColor: 'white',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#4a1d3f',
                      boxShadow: '0 2px 8px rgba(74, 29, 63, 0.1)'
                    }
                  }}>
                    <img 
                      src={img.preview} 
                      alt={`preview-${idx}`} 
                      style={{ 
                        width: 100, 
                        height: 100, 
                        objectFit: 'cover', 
                        borderRadius: 8,
                        display: 'block'
                      }} 
                    />
                    <Box sx={{ 
                      position: 'absolute', 
                      top: -8, 
                      right: -8,
                      backgroundColor: '#4a1d3f',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#3a162f'
                      }
                    }}
                    onClick={() => handleRemoveImage(idx)}
                    >
                      <CloseIcon sx={{ fontSize: 16, color: 'white' }} />
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mt: 1,
                      gap: 0.5
                    }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleMoveLeft(idx)} 
                        disabled={idx === 0}
                        sx={{ 
                          backgroundColor: '#f7f7f7',
                          color: '#717171',
                          width: 28,
                          height: 28,
                          '&:hover': { 
                            backgroundColor: '#4a1d3f',
                            color: 'white'
                          },
                          '&:disabled': { 
                            backgroundColor: '#f0f0f0',
                            color: '#cccccc' 
                          }
                        }}
                      >
                        <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleMoveRight(idx)} 
                        disabled={idx === selectedImages.length - 1}
                        sx={{ 
                          backgroundColor: '#f7f7f7',
                          color: '#717171',
                          width: 28,
                          height: 28,
                          '&:hover': { 
                            backgroundColor: '#4a1d3f',
                            color: 'white'
                          },
                          '&:disabled': { 
                            backgroundColor: '#f0f0f0',
                            color: '#cccccc' 
                          }
                        }}
                      >
                        <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          <TextField
            label="Open to Swap"
            select
            fullWidth
            margin="normal"
            value={openToSwap || 'false'}
            {...register('open_to_swap', { required: true })}
            onChange={e => setValue('open_to_swap', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4a1d3f'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4a1d3f'
                }
              }
            }}
          >
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </TextField>
          <TextField
            label="Open to Loan"
            select
            fullWidth
            margin="normal"
            value={openToLoan || 'false'}
            {...register('open_to_loan', { required: true })}
            onChange={e => setValue('open_to_loan', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4a1d3f'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4a1d3f'
                }
              }
            }}
          >
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </TextField>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={isSubmitting}
          sx={{ 
            color: '#717171',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { 
              backgroundColor: '#f7f7f7'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="listing-form" 
          variant="contained" 
          disabled={isSubmitting}
          sx={{ 
            backgroundColor: '#4a1d3f',
            color: 'white',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '8px',
            px: 3,
            py: 1,
            boxShadow: 'none',
            '&:hover': { 
              backgroundColor: '#3a162f',
              boxShadow: '0 2px 8px rgba(74, 29, 63, 0.3)'
            },
            '&:disabled': {
              backgroundColor: '#cccccc',
              color: '#666666'
            }
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
} 