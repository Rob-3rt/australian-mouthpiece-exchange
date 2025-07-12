import React from 'react';
import { Typography, Box, Button, Container, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

export default function NotFound() {
  return (
    <Box sx={{ 
      backgroundColor: '#ffffff', 
      minHeight: '100vh', 
      py: { xs: 4, md: 8 },
      display: 'flex',
      alignItems: 'center'
    }}>
      <Container maxWidth="sm">
        <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
          {/* 404 Card */}
          <Card sx={{ 
            border: '1px solid #dddddd',
            borderRadius: '16px',
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#4a1d3f', 
                  mb: 2,
                  fontSize: { xs: '4rem', md: '6rem' },
                  letterSpacing: -0.5
                }}
              >
                404
              </Typography>
              
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#222222', 
                  mb: 2,
                  letterSpacing: -0.5
                }}
              >
                Page not found
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#717171',
                  fontSize: '18px',
                  mb: 4,
                  lineHeight: 1.6
                }}
              >
                Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
              </Typography>

              <Button
                component={Link}
                to="/"
                variant="contained"
                startIcon={<HomeIcon />}
                sx={{ 
                  backgroundColor: '#4a1d3f',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '16px',
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 4,
                  py: 1.5,
                  boxShadow: 'none',
                  '&:hover': { 
                    backgroundColor: '#3a162f',
                    boxShadow: '0 2px 8px rgba(74, 29, 63, 0.3)'
                  }
                }}
              >
                Go back home
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
} 