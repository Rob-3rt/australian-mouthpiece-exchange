import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Card, CardContent, CardMedia, Button, Rating, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Container, Snackbar, IconButton } from '@mui/material';
import api from '../api/axios.js';
import { useAuth } from '../contexts/AuthContext';
import FlagIcon from '@mui/icons-material/Flag';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import LoanRequestModal from '../components/LoanRequestModal';

export default function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [rateStatus, setRateStatus] = useState(null);
  const [sellerRatings, setSellerRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagStatus, setFlagStatus] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);


  useEffect(() => {
    setLoading(true);
    api.get(`/api/listings/${id}`)
      .then(res => setListing(res.data))
      .catch(() => setError('Listing not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (listing?.user?.user_id) {
      setRatingsLoading(true);
      api.get(`/api/ratings/user/${listing.user.user_id}`)
        .then(res => setSellerRatings(res.data))
        .catch(() => setSellerRatings([]))
        .finally(() => setRatingsLoading(false));
    }
  }, [listing?.user?.user_id]);

  const handleSendMessage = async () => {
    try {
      await api.post('/api/messages', {
        to_user_id: listing.user.user_id,
        content: message,
        listing_id: listing.listing_id
      });
      setSnackbar({ open: true, message: 'Message sent!', severity: 'success' });
      setShowMessageForm(false);
      setMessage('');
    } catch {
      setSnackbar({ open: true, message: 'Failed to send message.', severity: 'error' });
    }
  };

  const handleRate = async () => {
    setRateStatus(null);
    try {
      await api.post('/api/ratings', {
        to_user_id: listing.user.user_id,
        transaction_id: listing.listing_id,
        stars: rating,
        comment
      });
      setSnackbar({ open: true, message: 'Rating submitted!', severity: 'success' });
      setRateModalOpen(false);
      setRating(5);
      setComment('');
    } catch {
      setSnackbar({ open: true, message: 'Failed to submit rating.', severity: 'error' });
    }
  };

  const handleFlag = async () => {
    setFlagStatus(null);
    try {
      await api.post('/api/moderation/flag', {
        content_id: listing.listing_id,
        reason: flagReason
      });
      setSnackbar({ open: true, message: 'Flag submitted!', severity: 'success' });
      setFlagModalOpen(false);
      setFlagReason('');
    } catch {
      setSnackbar({ open: true, message: 'Failed to submit flag.', severity: 'error' });
    }
  };

  const handleBuy = () => {
    setBuyModalOpen(false);
    setSnackbar({ open: true, message: 'Purchase request sent! (stub)', severity: 'success' });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!listing) return null;

  function getPaypalUrl(paypal, amount) {
    if (!paypal) return '#';
    paypal = paypal.trim();
    if (paypal.startsWith('https://www.paypal.com/paypalme/')) {
      return paypal;
    }
    if (paypal.startsWith('paypal.me/')) {
      return 'https://www.paypal.com/paypalme/' + paypal.replace('paypal.me/', '').replace(/^\//, '');
    }
    if (paypal.startsWith('www.paypal.me/')) {
      return 'https://www.paypal.com/paypalme/' + paypal.replace('www.paypal.me/', '').replace(/^\//, '');
    }
    if (paypal.startsWith('https://paypal.me/')) {
      return 'https://www.paypal.com/paypalme/' + paypal.replace('https://paypal.me/', '').replace(/^\//, '');
    }
    if (paypal.includes('@')) {
      const emailUser = paypal.split('@')[0];
      return `https://www.paypal.com/paypalme/${encodeURIComponent(emailUser)}`;
    }
    return `https://www.paypal.com/paypalme/${paypal.replace(/^\//, '')}`;
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
      <Box sx={{ py: 4 }}>
        <Grid container spacing={4} sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          flexWrap: 'nowrap'
        }}>
          {/* Left Column - Images */}
          <Grid item xs={12} md={6} sx={{ 
            width: { xs: '100%', md: '50%' },
            maxWidth: { xs: '100%', md: '50%' },
            flex: { xs: '0 0 100%', md: '0 0 50%' },
            flexShrink: 0
          }}>
            {/* Image Carousel */}
            {listing.photos && listing.photos.length > 0 && (
              <Box sx={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', mb: 3 }}>
                <IconButton
                  onClick={() => setCurrentPhoto((prev) => prev === 0 ? listing.photos.length - 1 : prev - 1)}
                  disabled={listing.photos.length === 1}
                  sx={{ 
                    position: 'absolute', 
                    left: 16, 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    zIndex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                  }}
                  aria-label="Previous image"
                >
                  <ArrowBackIosNewIcon />
                </IconButton>
                <img
                  src={listing.photos[currentPhoto]}
                  alt={listing.brand + ' ' + listing.model}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    display: 'block',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowImageModal(true)}
                />
                <IconButton
                  onClick={() => setCurrentPhoto((prev) => prev === listing.photos.length - 1 ? 0 : prev + 1)}
                  disabled={listing.photos.length === 1}
                  sx={{ 
                    position: 'absolute', 
                    right: 16, 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    zIndex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                  }}
                  aria-label="Next image"
                >
                  <ArrowForwardIosIcon />
                </IconButton>
                {/* Image indicator */}
                {listing.photos.length > 1 && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      bottom: 16, 
                      left: '50%', 
                      transform: 'translateX(-50%)', 
                      backgroundColor: 'rgba(0,0,0,0.7)', 
                      color: 'white', 
                      px: 2, 
                      py: 1,
                      borderRadius: '20px', 
                      fontSize: 14,
                      fontWeight: 500
                    }}
                  >
                    {currentPhoto + 1} of {listing.photos.length}
                  </Box>
                )}
              </Box>
            )}
            
            {/* Thumbnail Gallery */}
            {listing.photos && listing.photos.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                {listing.photos.map((photo, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentPhoto(index)}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: currentPhoto === index ? '2px solid #4a1d3f' : '2px solid transparent',
                      opacity: currentPhoto === index ? 1 : 0.7,
                      transition: 'all 0.2s ease',
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <img
                      src={photo}
                      alt={`${listing.brand} ${listing.model} - Image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Grid>

          {/* Right Column - Details */}
          <Grid item xs={12} md={6} sx={{ 
            width: { xs: '100%', md: '50%' },
            maxWidth: { xs: '100%', md: '50%' },
            flex: { xs: '0 0 100%', md: '0 0 50%' },
            flexShrink: 0
          }}>
            <Box sx={{ 
              height: 'fit-content',
              maxHeight: 'calc(100vh - 48px)',
              overflowY: 'auto',
              width: '100%',
              maxWidth: '100%',
              overflowX: 'hidden'
            }}>
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: '2rem', md: '2.2rem' },
                    color: '#222222',
                    mb: 1,
                    lineHeight: 1.2
                  }}
                >
                  {listing.brand} {listing.model}
                </Typography>
                {listing.size && (
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#717171',
                      mb: 2
                    }}
                  >
                    Size {listing.size}
                  </Typography>
                )}
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#222222',
                    mb: 2
                  }}
                >
                  ${listing.price}
                </Typography>
              </Box>

              {/* Details */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#222222',
                      mr: 2
                    }}
                  >
                    {listing.instrument_type}
                  </Typography>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#717171', mr: 2 }} />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#717171'
                    }}
                  >
                    {listing.condition} condition
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#222222',
                    lineHeight: 1.6,
                    mb: 3
                  }}
                >
                  {listing.description}
                </Typography>
              </Box>

              {/* Seller Info */}
              <Box sx={{ 
                p: 2.5, 
                backgroundColor: '#f7f7f7', 
                borderRadius: '12px',
                mb: 3,
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#222222',
                    mb: 1
                  }}
                >
                  Seller
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 500,
                      color: '#222222',
                      wordBreak: 'break-word'
                    }}
                  >
                    {listing.user.nickname || listing.user.name}
                  </Typography>
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#717171', flexShrink: 0 }} />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#717171',
                      wordBreak: 'break-word'
                    }}
                  >
                    {listing.user.location_state}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating 
                    value={listing.user.average_rating || 0} 
                    precision={0.1} 
                    readOnly 
                    size="small"
                    sx={{ '& .MuiRating-iconFilled': { color: '#4a1d3f' } }}
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#717171',
                      ml: 1
                    }}
                  >
                    ({listing.user.rating_count || 0} ratings)
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              {user && user.user_id !== listing.user.user_id && (
                <Box sx={{ width: '100%' }}>
                  {/* Primary Action Buttons - Same Line */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    gap: 2, 
                    mb: 2,
                    width: '100%',
                    flexWrap: 'wrap'
                  }}>
                    <Button 
                      variant="contained" 
                      onClick={() => setShowMessageForm(true)}
                      sx={{ 
                        backgroundColor: '#4a1d3f',
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '8px',
                        px: 3,
                        py: 1.5,
                        boxShadow: 'none',
                        '&:hover': { 
                          backgroundColor: '#3a162f',
                          boxShadow: '0 2px 8px rgba(74, 29, 63, 0.3)'
                        }
                      }}
                    >
                      Message Seller
                    </Button>
                    {/* PayPal Button or Fallback */}
                    {listing.paypal_link_effective ? (
                      <a
                        href={getPaypalUrl(listing.paypal_link_effective, listing.price)}
                        target="_blank"
                        rel="noopener noreferrer"
                        role="button"
                        aria-label="Pay the seller with PayPal"
                        style={{ textDecoration: 'none' }}
                        title="You're paying the seller directly via PayPal; our site is not a party to the transaction."
                      >
                        <Button 
                          variant="contained" 
                          color="success" 
                          sx={{ 
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 3,
                            py: 1.5,
                            boxShadow: 'none',
                            '&:hover': { 
                              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                            }
                          }}
                        >
                          Pay with PayPal
                        </Button>
                      </a>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography color="warning.main" fontWeight={600} sx={{ fontSize: '14px' }}>
                          No PayPal link provided
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  {/* Disclaimer */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '11px', lineHeight: 1.4 }}>
                      ⚠️ Important: Payments are handled off-site via PayPal or direct arrangement. Shipping is not included and must be arranged between buyer and seller. This site is not responsible for transactions, disputes, or delivery issues.
                    </Typography>
                  </Box>
                  
                  {/* Secondary Action Buttons */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    gap: 1,
                    width: '100%',
                    flexWrap: 'wrap'
                  }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => setRateModalOpen(true)}
                      sx={{ 
                        textTransform: 'none',
                        borderRadius: '8px',
                        borderColor: '#4a1d3f',
                        color: '#4a1d3f',
                        '&:hover': { 
                          borderColor: '#3a162f',
                          backgroundColor: 'rgba(74, 29, 63, 0.04)'
                        }
                      }}
                    >
                      Rate User
                    </Button>
                    <Button 
                      variant="text" 
                      color="error" 
                      startIcon={<FlagIcon />} 
                      onClick={() => setFlagModalOpen(true)}
                      sx={{ 
                        textTransform: 'none',
                        borderRadius: '8px',
                        '&:hover': { 
                          backgroundColor: 'rgba(244, 67, 54, 0.04)'
                        }
                      }}
                    >
                      Flag Listing
                    </Button>
                  </Box>
                </Box>
              )}
              
              {/* Show info if not logged in or is seller */}
              {!user && (
                <Alert severity="info" sx={{ mt: 2 }}>Log in to contact the seller or buy this mouthpiece.</Alert>
              )}
              {user && user.user_id === listing.user.user_id && (
                <Alert severity="info" sx={{ mt: 2 }}>You cannot message yourself or buy your own listing.</Alert>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Image Modal */}
        <Dialog 
          open={showImageModal} 
          onClose={() => setShowImageModal(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
              maxWidth: '90vw',
              maxHeight: '90vh'
            }
          }}
        >
          <Box sx={{ 
            position: 'relative', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '50vh'
          }}>
            {/* Close button */}
            <IconButton
              onClick={() => setShowImageModal(false)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.9)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
            
            {/* Navigation buttons */}
            {listing.photos && listing.photos.length > 1 && (
              <>
                <IconButton
                  onClick={() => setCurrentPhoto((prev) => prev === 0 ? listing.photos.length - 1 : prev - 1)}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.9)'
                    }
                  }}
                >
                  <ArrowBackIosNewIcon />
                </IconButton>
                <IconButton
                  onClick={() => setCurrentPhoto((prev) => prev === listing.photos.length - 1 ? 0 : prev + 1)}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.9)'
                    }
                  }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </>
            )}
            
            {/* Full-size image */}
            <img
              src={listing.photos[currentPhoto]}
              alt={listing.brand + ' ' + listing.model}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            
            {/* Image counter */}
            {listing.photos && listing.photos.length > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  px: 3,
                  py: 1,
                  borderRadius: '20px',
                  fontSize: 16,
                  fontWeight: 600
                }}
              >
                {currentPhoto + 1} of {listing.photos.length}
              </Box>
            )}
          </Box>
        </Dialog>

        {/* Rate User Modal */}
        <Dialog open={rateModalOpen} onClose={() => setRateModalOpen(false)}>
          <DialogTitle>Rate User</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Rating value={rating} onChange={(_, v) => setRating(v)} size="large" />
              <TextField
                label="Comment"
                multiline
                rows={3}
                fullWidth
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRateModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleRate} disabled={!rating || !comment.trim()}>Submit</Button>
          </DialogActions>
        </Dialog>
        {rateStatus && <Alert sx={{ mt: 2 }} severity={rateStatus === 'Rating submitted!' ? 'success' : 'error'}>{rateStatus}</Alert>}

        {/* Flag Listing Modal */}
        <Dialog open={flagModalOpen} onClose={() => setFlagModalOpen(false)}>
          <DialogTitle>Flag Listing</DialogTitle>
          <DialogContent>
            <TextField
              label="Reason"
              multiline
              rows={3}
              fullWidth
              value={flagReason}
              onChange={e => setFlagReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFlagModalOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleFlag} disabled={!flagReason.trim()}>Submit</Button>
          </DialogActions>
        </Dialog>
        {flagStatus && <Alert sx={{ mt: 2 }} severity={flagStatus === 'Flag submitted!' ? 'success' : 'error'}>{flagStatus}</Alert>}

        {/* Message Seller Modal */}
        <Dialog open={showMessageForm} onClose={() => setShowMessageForm(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Message Seller</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Send a message to {listing.user.nickname || listing.user.name} about this {listing.brand} {listing.model}.
            </Typography>
            <TextField
              label="Your Message"
              multiline
              rows={6}
              fullWidth
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your message here..."
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setShowMessageForm(false);
              setMessage('');
            }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSendMessage} 
              disabled={!message.trim()}
            >
              Send Message
            </Button>
          </DialogActions>
        </Dialog>

        {/* Buy Now Modal */}
        <Dialog open={buyModalOpen} onClose={() => setBuyModalOpen(false)}>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to buy this mouthpiece for ${listing.price}?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBuyModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleBuy}>Confirm</Button>
          </DialogActions>
        </Dialog>

        {/* Loan Request Button */}
        {listing.open_to_loan && listing.status === 'active' && user && user.user_id !== listing.user.user_id && (
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2, mb: 2 }}
            onClick={() => setLoanModalOpen(true)}
          >
            Request Loan
          </Button>
        )}
        <LoanRequestModal
          listing={listing}
          isOpen={loanModalOpen}
          onClose={() => setLoanModalOpen(false)}
          onSuccess={() => setSnackbar({ open: true, message: 'Loan request sent!', severity: 'success' })}
        />

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Seller Ratings</Typography>
          {ratingsLoading ? <CircularProgress /> : (
            sellerRatings.length === 0 ? <Typography>No ratings yet.</Typography> : (
              <Grid container spacing={2}>
                {sellerRatings.map(rating => (
                  <Grid item xs={12} sm={12} key={rating.rating_id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Rating value={rating.stars} readOnly />
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
      </Box>
      
      {/* Footer Disclaimer */}
      <Box sx={{ 
        mt: 6, 
        pt: 4, 
        borderTop: '1px solid #dddddd',
        backgroundColor: '#f7f7f7',
        borderRadius: '12px',
        p: 3
      }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#717171',
            lineHeight: 1.6,
            textAlign: 'center',
            fontStyle: 'italic'
          }}
        >
          Note: The Mouthpiece Exchange is a platform that enables individuals to list and sell mouthpieces directly to buyers. We do not facilitate payments, handle shipping, or take any commission from sales. All transactions are arranged solely between the buyer and seller.
        </Typography>
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
  );
} 