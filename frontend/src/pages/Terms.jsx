import React from 'react';
import { Typography, Box, Container, Card, CardContent } from '@mui/material';

export default function Terms() {
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
          Terms and Conditions of Use
        </Typography>

        <Card sx={{ 
          border: '1px solid #dddddd',
          borderRadius: '16px',
          boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 4, md: 6 } }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#4a1d3f', fontWeight: 600 }}>
              Last updated: {new Date().toLocaleDateString()}
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#222222', fontWeight: 600 }}>
                1. Acceptance of Terms
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#717171', lineHeight: 1.6 }}>
                By accessing and using The Australian Mouthpiece Exchange ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#222222', fontWeight: 600 }}>
                2. Service Description
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#717171', lineHeight: 1.6 }}>
                The Australian Mouthpiece Exchange is a free, community-driven platform designed for buying, selling, and swapping brass mouthpieces. The Platform acts as a marketplace facilitator only and does not participate in transactions between users.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#222222', fontWeight: 600 }}>
                3. User Responsibilities
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#717171', lineHeight: 1.6 }}>
                • You are responsible for all transactions you engage in through the Platform<br/>
                • You must provide accurate and truthful information in your listings<br/>
                • You must exercise due diligence when dealing with other users<br/>
                • You are responsible for verifying the condition and authenticity of items<br/>
                • You must comply with all applicable laws and regulations
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#222222', fontWeight: 600 }}>
                4. Transaction Terms
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#717171', lineHeight: 1.6 }}>
                • All transactions are conducted directly between buyers and sellers<br/>
                • The Platform does not process payments, handle shipping, or take commissions<br/>
                • Users are responsible for arranging payment methods and shipping<br/>
                • The Platform is not liable for any disputes between users
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#222222', fontWeight: 600 }}>
                5. Safety and Security
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#717171', lineHeight: 1.6 }}>
                • Meet in safe, public locations when possible<br/>
                • Use secure payment methods<br/>
                • Verify the identity of the other party<br/>
                • Trust your instincts and report suspicious activity
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#222222', fontWeight: 600 }}>
                6. Prohibited Activities
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#717171', lineHeight: 1.6 }}>
                • Listing counterfeit or stolen items<br/>
                • Harassing or threatening other users<br/>
                • Spamming or posting irrelevant content<br/>
                • Attempting to circumvent the Platform's security measures<br/>
                • Violating any applicable laws or regulations
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#222222', fontWeight: 600 }}>
                7. Privacy and Data
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#717171', lineHeight: 1.6 }}>
                • We collect and process personal data in accordance with our Privacy Policy<br/>
                • User information is used solely for Platform functionality<br/>
                • We do not sell or share personal data with third parties<br/>
                • Users are responsible for protecting their own account information
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#222222', fontWeight: 600 }}>
                8. Limitation of Liability
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#717171', lineHeight: 1.6 }}>
                The Platform is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our service, including but not limited to financial losses, personal injury, or property damage.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#222222', fontWeight: 600 }}>
                9. Account Termination
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#717171', lineHeight: 1.6 }}>
                We reserve the right to terminate or suspend accounts that violate these terms. Users may also terminate their accounts at any time by contacting us.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#222222', fontWeight: 600 }}>
                10. Changes to Terms
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#717171', lineHeight: 1.6 }}>
                We may update these terms from time to time. Continued use of the Platform after changes constitutes acceptance of the new terms.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#222222', fontWeight: 600 }}>
                11. Contact Information
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#717171', lineHeight: 1.6 }}>
                For questions about these terms, please contact us through the Platform or email us at the address provided in your account settings.
              </Typography>
            </Box>

            <Box sx={{ 
              mt: 4, 
              p: 3, 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #dddddd'
            }}>
              <Typography variant="body2" sx={{ color: '#717171', fontStyle: 'italic' }}>
                By using The Australian Mouthpiece Exchange, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions of Use.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
} 