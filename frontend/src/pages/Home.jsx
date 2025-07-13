import React, { useEffect, useState, useRef } from 'react';
import { Typography, Container, Box, Grid, Card, CardContent, Button, Rating, CircularProgress, Pagination } from '@mui/material';
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
            {/* Latest Listings Title */}
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 450, 
                color: '#222222', 
                mb: 3,
                textAlign: 'left',
                letterSpacing: -0.5
              }}
            >
              Latest Listings
            </Typography>
            
            <Box sx={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: 'flex-start'
            }}>
              {listings.map(listing => (
              <Box key={listing.listing_id} sx={{ 
                flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 4px)', md: '0 0 calc(25% - 6px)' },
                display: 'flex'
              }}>
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
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%'
                  }}
                  onClick={() => navigate(`/listings/${listing.listing_id}`)}
                >
                  {/* Image container */}
                  <Box sx={{ 
                    position: 'relative',
                    width: '100%',
                    height: 280,
                    backgroundColor: '#f7f7f7',
                    overflow: 'hidden'
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
                        fontSize: '14px'
                      }}>
                        No Image
                      </Box>
                    )}
                  </Box>
                  
                  {/* Content */}
                  <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '16px',
                        color: '#222222',
                        mb: 1,
                        lineHeight: 1.2
                      }}
                    >
                      {listing.brand} {listing.model} {listing.size && `(${listing.size})`}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#717171',
                        fontSize: '14px',
                        mb: 1
                      }}
                    >
                      {listing.instrument_type} • {listing.condition}
                    </Typography>
                    
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        fontSize: '18px',
                        color: '#222222',
                        mb: 1
                      }}
                    >
                      ${listing.price}
                    </Typography>
                    
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
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      pt: 1,
                      borderTop: '1px solid #f0f0f0',
                      marginTop: 'auto'
                    }}>
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#222222'
                          }}
                        >
                          {listing.user.nickname || listing.user.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#717171',
                            fontSize: '12px'
                          }}
                        >
                          {listing.user.location_state}
                        </Typography>
                      </Box>
                      <Rating 
                        value={listing.user.average_rating || 0} 
                        precision={0.1} 
                        readOnly 
                        size="small"
                        sx={{ '& .MuiRating-iconFilled': { color: '#ff385c' } }}
                      />
                    </Box>
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
          
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