import React, { useEffect, useState, useRef } from 'react';
import { Typography, Box, TextField, Button, CircularProgress, Container, Card, CardContent } from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

function getPaypalUrl(paypalLink, price) {
  if (!paypalLink) return '#';
  if (paypalLink.includes('paypal.me')) {
    return `${paypalLink}/${price}`;
  }
  return paypalLink;
}

export default function Conversation() {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listing');
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [listing, setListing] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    if (listingId) {
      fetchListing();
    }
  }, [conversationId, listingId]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/messages/${conversationId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchListing = async () => {
    try {
      const response = await api.get(`/api/listings/${listingId}`);
      setListing(response.data);
    } catch (error) {
      console.error('Failed to fetch listing:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await api.post(`/api/messages/${conversationId}`, {
        content: newMessage,
        listing_id: listingId
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const sortedMessages = [...messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (loading) {
    return (
      <Box sx={{ 
        backgroundColor: '#ffffff', 
        minHeight: '100vh', 
        py: { xs: 4, md: 6 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress sx={{ color: '#4a1d3f' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: '#ffffff', 
      minHeight: '100vh', 
      py: { xs: 4, md: 6 }
    }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              color: '#222222', 
              mb: 2,
              letterSpacing: -0.5
            }}
          >
            Conversation
          </Typography>
        </Box>

        {/* Listing Details */}
        {listing && (
          <Card sx={{ 
            border: '1px solid #dddddd',
            borderRadius: '12px',
            overflow: 'hidden',
            mb: 4,
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <a 
                  href={`/listings/${listing.listing_id}`} 
                  style={{ 
                    textDecoration: 'none', 
                    color: 'inherit', 
                    display: 'flex', 
                    alignItems: 'center' 
                  }}
                >
                  {listing.photos && listing.photos.length > 0 && (
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img 
                        src={listing.photos[0]} 
                        alt={listing.brand + ' ' + listing.model} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }} 
                      />
                    </Box>
                  )}
                  <Box sx={{ ml: 2 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#222222'
                      }}
                    >
                      {listing.brand} {listing.model}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#717171'
                      }}
                    >
                      ${listing.price}
                    </Typography>
                  </Box>
                </a>
                
                {/* PayPal Button */}
                {listing.paypal_link_effective && (
                  <a
                    href={getPaypalUrl(listing.paypal_link_effective, listing.price)}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="button"
                    aria-label="Pay the seller with PayPal"
                    style={{ textDecoration: 'none', marginLeft: 'auto' }}
                    title="You're paying the seller directly via PayPal; our site is not a party to the transaction."
                  >
                    <Button 
                      variant="contained" 
                      sx={{ 
                        backgroundColor: '#0070ba',
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '8px',
                        px: 3,
                        py: 1,
                        boxShadow: 'none',
                        '&:hover': { 
                          backgroundColor: '#005ea6',
                          boxShadow: '0 2px 8px rgba(0, 112, 186, 0.3)'
                        }
                      }}
                    >
                      Pay Seller Directly With PayPal
                    </Button>
                  </a>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <Card sx={{ 
          border: '1px solid #dddddd',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
          mb: 3
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1, 
              minHeight: 400, 
              maxHeight: 500,
              overflowY: 'auto',
              p: 3
            }}>
              {sortedMessages.map((msg, idx) => {
                const isSent = msg.from_user_id === user.user_id;
                return (
                  <Box
                    key={idx}
                    sx={{ 
                      display: 'flex',
                      justifyContent: isSent ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-end',
                      mt: idx > 0 && sortedMessages[idx - 1].from_user_id !== msg.from_user_id ? 2 : 0
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: isSent ? '#4a1d3f' : '#f7f7f7',
                        color: isSent ? 'white' : '#222222',
                        px: 3,
                        py: 2,
                        borderRadius: isSent ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        maxWidth: '70%',
                        fontSize: 16,
                        boxShadow: 'none',
                        wordBreak: 'break-word',
                        mb: 0.5,
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          wordBreak: 'break-word', 
                          mb: 1,
                          lineHeight: 1.4
                        }}
                      >
                        {msg.content || msg.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ 
                          color: isSent ? 'rgba(255,255,255,0.7)' : '#717171',
                          fontSize: 12, 
                          textAlign: isSent ? 'right' : 'left', 
                          display: 'block' 
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>
          </CardContent>
        </Card>

        {/* Message Input */}
        <Box component="form" onSubmit={handleSendMessage}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '24px',
                  backgroundColor: '#f7f7f7',
                  '& fieldset': {
                    borderColor: '#dddddd',
                  },
                  '&:hover fieldset': {
                    borderColor: '#222222',
                  },
                                      '&.Mui-focused fieldset': {
                      borderColor: '#4a1d3f',
                    },
                },
                '& .MuiInputBase-input': {
                  padding: '12px 20px',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={sending || !newMessage.trim()}
              sx={{
                backgroundColor: '#4a1d3f',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '24px',
                px: 4,
                py: 1.5,
                boxShadow: 'none',
                minWidth: 'auto',
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
              {sending ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Send'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 