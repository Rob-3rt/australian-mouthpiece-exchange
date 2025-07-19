import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #dddddd',
        py: 4,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: 2
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: { xs: 'center', md: 'left' } }}
          >
            © 2025 The Australian Mouthpiece Exchange. All rights reserved.
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center'
            }}
          >
            <Link
              component={RouterLink}
              to="/terms"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: '#4a1d3f',
                  textDecoration: 'underline'
                }
              }}
            >
              Terms and Conditions
            </Link>
            <Link
              component={RouterLink}
              to="/about"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: '#4a1d3f',
                  textDecoration: 'underline'
                }
              }}
            >
              About Us
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 