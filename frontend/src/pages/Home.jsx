import React, { useEffect, useState, useRef } from 'react';
import { Typography, Container, Box, Grid, Card, CardContent, Button, Rating, CircularProgress, Pagination, IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { getListings } from '../api/listings';
import { useNavigate } from 'react-router-dom';
import FilterBar from '../components/FilterBar';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableInstrumentTypes, setAvailableInstrumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const debounceTimeout = useRef();
  const navigate = useNavigate();



  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400);
    return () => clearTimeout(debounceTimeout.current);
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = { ...debouncedFilters, page: pagination.page };
    getListings(params)
      .then(response => {
        if (response.listings && response.availableModels) {
          setListings(response.listings);
          setAvailableModels(response.availableModels);
          setAvailableBrands(response.availableBrands || []);
          setAvailableInstrumentTypes(response.availableInstrumentTypes || []);
          setPagination(response.pagination || { page: 1, totalPages: 1, totalCount: 0 });
        } else {
          // Handle old response format for backward compatibility
          setListings(response);
          setAvailableModels([]);
          setAvailableBrands([]);
          setAvailableInstrumentTypes([]);
          setPagination({ page: 1, totalPages: 1, totalCount: 0 });
        }
      })
      .catch(err => {
        console.error('Error fetching listings:', err);
        setError(err.response?.data?.error || 'Failed to load listings');
      })
      .finally(() => setLoading(false));
  }, [debouncedFilters, pagination.page]);

  const handleReset = () => {
    setFilters({});
    setPagination({ page: 1, totalPages: 1, totalCount: 0 });
  };
  
  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const ListingCard = ({ listing, viewMode }) => (
    <Card
      sx={{
        cursor: 'pointer',
        border: '1px solid #dddddd',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': { 
          transform: 'translateY(-2px)', 
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          borderColor: '#222222'
        },
        width: '100%',
        height: viewMode === 'grid' ? 380 : 120,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: viewMode === 'grid' ? 'column' : 'row',
      }}
      onClick={() => navigate(`/listings/${listing.listing_id}`)}
    >
      {/* Image container */}
      <Box sx={{ 
        position: 'relative',
        width: viewMode === 'grid' ? '100%' : '120px',
        height: viewMode === 'grid' ? 280 : '100%',
        backgroundColor: '#f7f7f7',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {listing.photos && listing.photos.length > 0 ? (
          <img
            src={listing.photos[0]}
            alt={listing.brand + ' ' + listing.model}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#717171',
            fontSize: '12px'
          }}>
            No Image
          </Box>
        )}
      </Box>
      
      {/* Content */}
      <Box sx={{ 
        p: viewMode === 'grid' ? 3 : 2, 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: viewMode === 'grid' ? 'column' : 'row',
        alignItems: viewMode === 'list' ? 'center' : 'stretch',
        gap: viewMode === 'list' ? 2 : 0
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              fontSize: viewMode === 'grid' ? '16px' : '14px',
              color: '#222222',
              mb: viewMode === 'grid' ? 1 : 0.5,
              lineHeight: 1.2
            }}
          >
            {listing.brand} {listing.model} {listing.size && `(${listing.size})`}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#717171',
              fontSize: viewMode === 'grid' ? '14px' : '12px',
              mb: viewMode === 'grid' ? 1 : 0.5
            }}
          >
            {listing.instrument_type} • {listing.condition}
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              fontSize: viewMode === 'grid' ? '18px' : '16px',
              color: '#222222',
              mb: viewMode === 'grid' ? 1 : 0.5
            }}
          >
            ${listing.price}
          </Typography>
          
          {viewMode === 'grid' && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#717171',
                fontSize: '14px',
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.4
              }}
            >
              {listing.description}
            </Typography>
          )}
          
          {viewMode === 'list' && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#717171',
                fontSize: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.4,
                maxWidth: '250px'
              }}
            >
              {listing.description}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pt: viewMode === 'grid' ? 1 : 0,
          borderTop: viewMode === 'grid' ? '1px solid #f0f0f0' : 'none',
          marginTop: viewMode === 'grid' ? 'auto' : 0,
          flexDirection: viewMode === 'list' ? 'column' : 'row',
          gap: viewMode === 'list' ? 0.5 : 0,
          alignItems: viewMode === 'list' ? 'flex-end' : 'center'
        }}>
          <Box sx={{ textAlign: viewMode === 'list' ? 'right' : 'left' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                fontSize: viewMode === 'grid' ? '14px' : '12px',
                color: '#222222'
              }}
            >
              {listing.user.nickname || listing.user.name}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#717171',
                fontSize: viewMode === 'grid' ? '12px' : '10px'
              }}
            >
              {listing.user.location_state}
            </Typography>
          </Box>
          <Rating 
            value={listing.user.average_rating || 0} 
            precision={0.1} 
            readOnly 
            size={viewMode === 'grid' ? 'small' : 'small'}
            sx={{ 
              '& .MuiRating-iconFilled': { color: '#ff385c' },
              fontSize: viewMode === 'list' ? '14px' : 'inherit'
            }}
          />
        </Box>
      </Box>
    </Card>
  );

  return (
    <Box sx={{ backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #4a1d3f 0%, #3a162f 100%)',
          color: 'white',
          py: 8,
          px: 2,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: -0.5
            }}
          >
            Find Your Perfect Brass Mouthpiece
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              fontWeight: 400,
              opacity: 0.9,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Buy, sell, and trade brass mouthpieces with musicians across Australia
          </Typography>
          
          {/* Filters Section */}
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            availableModels={availableModels}
            availableBrands={availableBrands}
            availableInstrumentTypes={availableInstrumentTypes}
            onReset={handleReset}
            variant="hero"
          />
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={8}>
            <CircularProgress sx={{ color: '#ff385c' }} />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={8}>
            <Typography color="error" variant="h6" sx={{ fontWeight: 600 }}>
              {error}
            </Typography>
          </Box>
        ) : listings.length === 0 ? (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" p={8}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#222222', mb: 2 }}>
              No listings found
            </Typography>
            <Typography variant="body1" sx={{ color: '#717171', textAlign: 'center' }}>
              Try adjusting your filters or check back later for new listings.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Latest Listings Title and View Toggle */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 450, 
                  color: '#222222',
                  letterSpacing: -0.5
                }}
              >
                Latest Listings
              </Typography>
              
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    border: '1px solid #dddddd',
                    color: '#717171',
                    '&.Mui-selected': {
                      backgroundColor: '#4a1d3f',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#3a162f'
                      }
                    },
                    '&:hover': {
                      backgroundColor: '#f7f7f7'
                    }
                  }
                }}
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <ViewModuleIcon />
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <ViewListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            {viewMode === 'grid' ? (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)'
                },
                gap: 2,
                width: '100%'
              }}>
                {listings.map(listing => (
                  <ListingCard key={listing.listing_id} listing={listing} viewMode="grid" />
                ))}
              </Box>
            ) : (
              <Grid container spacing={2} sx={{ width: '100%', margin: 0 }}>
                {listings.map(listing => (
                  <Grid item xs={12} sm={6} key={listing.listing_id} sx={{ display: 'flex', width: '100%' }}>
                    <ListingCard listing={listing} viewMode="list" />
                  </Grid>
                ))}
              </Grid>
            )}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 6,
              mb: 2
            }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '8px',
                    fontWeight: 600,
                    '&.Mui-selected': {
                      backgroundColor: '#4a1d3f',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#3a162f'
                      }
                    }
                  }
                }}
              />
            </Box>
          )}
          
          {/* Results count */}
          {pagination.totalCount > 0 && (
            <Box sx={{ textAlign: 'center', mt: 2, mb: 4 }}>
              <Typography variant="body2" sx={{ color: '#717171' }}>
                Showing {((pagination.page - 1) * 24) + 1} - {Math.min(pagination.page * 24, pagination.totalCount)} of {pagination.totalCount} listings
              </Typography>
            </Box>
          )}
          </>
        )}
      </Container>
    </Box>
  );
} 