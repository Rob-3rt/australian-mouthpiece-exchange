import React from 'react';
import { Typography, Box, Container, Card, CardContent, Avatar } from '@mui/material';

export default function About() {
  return (
    <Box sx={{ 
      backgroundColor: '#ffffff', 
      minHeight: '100vh', 
      py: { xs: 4, md: 6 }
    }}>
      <Container maxWidth="md">
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700, 
            color: '#222222', 
            mb: 4,
            letterSpacing: -0.5
          }}
        >
          About Us
        </Typography>

        <Card sx={{ 
          border: '1px solid #dddddd',
          borderRadius: '16px',
          boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 4, md: 6 } }}>
            {/* Mission Statement */}
            <Box sx={{ 
              p: 4, 
              backgroundColor: '#f8f9fa', 
              borderRadius: '12px',
              border: '1px solid #dddddd',
              textAlign: 'center',
              mb: 4
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#4a1d3f', 
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Our Mission
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#717171', 
                  lineHeight: 1.8,
                  fontStyle: 'italic'
                }}
              >
                Our mission is to help Australian brass players connect, trade, and explore. Whether you're selling a mouthpiece that wasn't right for you or searching for your next one, the Australian Mouthpiece Exchange is a simple, free, dedicated space to make it happen.
              </Typography>
            </Box>

            {/* About Us Section */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#222222', 
                  fontWeight: 600,
                  mb: 2
                }}
              >
                About Us
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#717171', 
                  lineHeight: 1.8,
                  mb: 3
                }}
              >
                The Mouthpiece Exchange is a free, community-driven platform designed specifically for buying, selling, or swapping brass mouthpieces. You can filter listings by instrument type, brand, and other key details—making it easier than ever to find exactly what you're looking for.
              </Typography>
            </Box>

            {/* How It Works */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#222222', 
                  fontWeight: 600,
                  mb: 2
                }}
              >
                How It Works
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#717171', 
                  lineHeight: 1.8,
                  mb: 3
                }}
              >
                This service is completely free to use. We do not charge listing fees, take commissions, process payments, or handle shipping. All transactions are arranged directly between buyers and sellers. As such, we encourage users to exercise the same level of caution and common sense they would when using platforms like Facebook Marketplace: vet the other party, meet in safe locations where possible, and use secure payment methods.
              </Typography>
            </Box>

            {/* Rob Maher Section */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              alignItems: { xs: 'center', md: 'flex-start' },
              gap: 3,
              mb: 4
            }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120,
                  border: '3px solid #4a1d3f'
                }}
                alt="Rob Maher"
                src="/rob-maher.jpg"
              />
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#4a1d3f',
                    mb: 2
                  }}
                >
                  Rob Maher
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#717171', 
                    lineHeight: 1.6,
                    mb: 2
                  }}
                >
                  The Australian Mouthpiece Exchange was founded by Rob Maher, a trombone player and active member of both the Glenorchy City Brass Band and the Hobart Wind Symphony.
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#717171', 
                    lineHeight: 1.8
                  }}
                >
                  Like many brass musicians, Rob found himself with a growing collection of mouthpieces over the years—some no longer in use, but still valuable to the right player. After trying platforms like Facebook Marketplace, he decided there was a need for a dedicated space where brass players across Australia could easily list, find, and swap mouthpieces. That idea led to the creation of the Mouthpiece Exchange.
                </Typography>
              </Box>
            </Box>

            {/* Contact Information */}
            <Box sx={{ 
              mt: 4, 
              p: 3, 
              backgroundColor: '#4a1d3f', 
              borderRadius: '12px',
              color: 'white'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Get in Touch
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  lineHeight: 1.6,
                  mb: 2
                }}
              >
                Have questions or suggestions? We'd love to hear from you! The Mouthpiece Exchange is built for the community, by the community. Your feedback helps us make this platform better for everyone.
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  lineHeight: 1.6,
                  fontWeight: 600
                }}
              >
                Email: mouthpieceexchange@gmail.com
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
} 