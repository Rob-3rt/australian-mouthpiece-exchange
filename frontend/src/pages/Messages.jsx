import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid, Card, CardContent, CircularProgress, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../api/axios';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { refreshUnreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
    
    // Refresh conversations when page gains focus (user returns from conversation)
    const handleFocus = () => {
      fetchConversations();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/api/messages');
      console.log('Fetched conversations:', response.data);
      setConversations(response.data);
      // Refresh unread count in notification context
      refreshUnreadCount();
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (userId, listingId) => {
    console.log('Clicking conversation:', { userId, listingId });
    navigate(`/messages/${userId}${listingId ? `?listing=${listingId}` : ''}`);
  };

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
            Messages
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#717171',
              fontSize: '18px'
            }}
          >
            Your conversations with other users
          </Typography>
        </Box>

        {conversations.length === 0 ? (
          <Card sx={{ 
            border: '1px solid #dddddd',
            borderRadius: '16px',
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ 
              p: { xs: 4, md: 6 },
              textAlign: 'center'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#717171',
                  mb: 2
                }}
              >
                No conversations yet
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#717171'
                }}
              >
                Start browsing listings to connect with sellers
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...conversations]
              .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
              .map(conv => (
                <Card
                  key={conv.conversation_id + '_' + (conv.listing_id || 'none')}
                  sx={{
                    border: '1px solid #dddddd',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    width: '100%',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                      borderColor: '#222222'
                    }
                  }}
                  onClick={() => handleConversationClick(conv.conversation_id, conv.listing_id)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {conv.listing_photo && (
                        <Box sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <img
                            src={conv.listing_photo}
                            alt="Listing thumbnail"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: '#222222',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {conv.other_user ? (conv.other_user.nickname || conv.other_user.name) : 'Unknown User'}
                        </Typography>
                        {conv.listing_brand && conv.listing_model && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#4a1d3f',
                              fontWeight: 500,
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {conv.listing_brand} {conv.listing_model}
                          </Typography>
                        )}
                        <Box sx={{
                          background: '#f7f7f7',
                          borderRadius: '8px',
                          px: 2,
                          py: 1,
                          mb: 1,
                          color: '#444',
                          fontSize: '15px',
                          fontWeight: 400,
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-line',
                          lineHeight: 1.5,
                          border: '1px solid #ececec',
                        }}>
                          {conv.last_message_preview}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#717171',
                            fontSize: '12px'
                          }}
                        >
                          {new Date(conv.updated_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Box>
        )}
      </Container>
    </Box>
  );
} 