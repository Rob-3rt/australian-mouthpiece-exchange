import React, { useEffect, useState } from 'react';
import { Typography, Grid, Card, CardContent, Box, CircularProgress, Container } from '@mui/material';
import { getListings } from '../api/listings';
import { useNavigate } from 'react-router-dom';
import FilterBar from '../components/FilterBar';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    getListings(filters)
      .then(response => {
        if (response.listings && response.availableModels) {
          setListings(response.listings);
          setAvailableModels(response.availableModels);
        } else {
          setListings(response);
          setAvailableModels([]);
        }
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load listings');
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const handleReset = () => setFilters({});

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', py: { xs: 2, md: 6 } }}>
      <Container maxWidth="lg">
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 4, color: '#222', letterSpacing: -0.5 }}>
          Browse Listings
        </Typography>
        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          availableModels={availableModels}
          onReset={handleReset}
        />
        {/* Listings Grid */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={8}>
            <CircularProgress sx={{ color: '#4a1d3f' }} />
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
          <Grid container spacing={4}>
            {listings.map(listing => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={listing.listing_id}>
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
                    display: 'block',
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
                  <Box sx={{ p: 3 }}>
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
                      borderTop: '1px solid #f0f0f0'
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
                        sx={{ '& .MuiRating-iconFilled': { color: '#4a1d3f' } }}
                      />
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
} 