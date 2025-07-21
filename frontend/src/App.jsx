import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, Avatar, Menu, MenuItem, IconButton, Badge, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';
import RegistrationSuccess from './pages/RegistrationSuccess';
import Listings from './pages/Listings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ListingDetails from './pages/ListingDetails';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import AdminDashboard from './pages/AdminDashboard';
import MyListings from './pages/MyListings';
import Terms from './pages/Terms';
import About from './pages/About';
import Loans from './pages/Loans';
import { useAuth } from './contexts/AuthContext';
import { useNotifications } from './contexts/NotificationContext';
import CreateListingModal from './components/CreateListingModal';
import Footer from './components/Footer';
import MailIcon from '@mui/icons-material/Mail';

function ProtectedRoute({ children }) {
  const { user, loadingUser } = useAuth();
  if (loadingUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <span style={{ color: '#4a1d3f', fontWeight: 600, fontSize: 20 }}>Loading...</span>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loadingUser } = useAuth();
  if (loadingUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <span style={{ color: '#4a1d3f', fontWeight: 600, fontSize: 20 }}>Loading...</span>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (!user.is_admin) {
    return <Navigate to="/" />;
  }
  return children;
}

function NavBar({ onOpenCreateListing }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);
  
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  
  const handleMobileMenu = (event) => setMobileMenuAnchor(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);

  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #dddddd',
        mb: 0 
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 80 }}>
          {/* Logo */}
          <Typography
            variant={isMobile ? "h6" : "h5"}
            component={Link}
            to="/"
            sx={{ 
              color: '#4a1d3f', 
              textDecoration: 'none', 
              fontWeight: 700, 
              letterSpacing: -0.5,
              '&:hover': {
                color: '#3a162f'
              }
            }}
          >
            {isMobile ? 'Mouthpiece Exchange' : 'The Australian Mouthpiece Exchange'}
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user && (
                <Badge
                  color="error"
                  variant={unreadCount > 0 ? 'dot' : undefined}
                  badgeContent={unreadCount > 0 ? unreadCount : undefined}
                  overlap="rectangular"
                  sx={{ '& .MuiBadge-badge': { right: -6, top: 6 } }}
                >
                  <Button 
                    component={Link} 
                    to="/messages"
                    sx={{ 
                      color: '#222222',
                      fontWeight: 600,
                      fontSize: '14px',
                      textTransform: 'none',
                      borderRadius: '22px',
                      px: 3,
                      py: 1,
                      '&:hover': { 
                        backgroundColor: '#f7f7f7',
                        color: '#222222'
                      }
                    }}
                    startIcon={<MailIcon sx={{ fontSize: 20 }} />}
                  >
                    Messages
                  </Button>
                </Badge>
              )}
              
              {user && (
                <Button 
                  component={Link} 
                  to="/my-listings"
                  sx={{ 
                    color: '#222222',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'none',
                    borderRadius: '22px',
                    px: 3,
                    py: 1,
                    '&:hover': { 
                      backgroundColor: '#f7f7f7',
                      color: '#222222'
                    }
                  }}
                >
                  My Listings
                </Button>
              )}
              {user && (
                <Button 
                  component={Link} 
                  to="/loans"
                  sx={{ 
                    color: '#222222',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'none',
                    borderRadius: '22px',
                    px: 3,
                    py: 1,
                    '&:hover': { 
                      backgroundColor: '#f7f7f7',
                      color: '#222222'
                    }
                  }}
                >
                  Loans
                </Button>
              )}
              
              {user && user.is_admin && (
                <Button 
                  component={Link} 
                  to="/admin"
                  sx={{ 
                    color: '#222222',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'none',
                    borderRadius: '22px',
                    px: 3,
                    py: 1,
                    '&:hover': { 
                      backgroundColor: '#f7f7f7',
                      color: '#222222'
                    }
                  }}
                >
                  Admin
                </Button>
              )}
              
              {!user ? (
                <>
                  <Button 
                    component={Link} 
                    to="/login"
                    sx={{ 
                      color: '#222222',
                      fontWeight: 600,
                      fontSize: '14px',
                      textTransform: 'none',
                      borderRadius: '22px',
                      px: 3,
                      py: 1,
                      '&:hover': { 
                        backgroundColor: '#f7f7f7',
                        color: '#222222'
                      }
                    }}
                  >
                    Log in
                  </Button>
                  <Button 
                    variant="contained"
                    component={Link} 
                    to="/register"
                    sx={{ 
                      backgroundColor: '#4a1d3f',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '14px',
                      textTransform: 'none',
                      borderRadius: '22px',
                      px: 3,
                      py: 1,
                      '&:hover': { 
                        backgroundColor: '#3a162f'
                      }
                    }}
                  >
                    Sign up
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    sx={{ 
                      backgroundColor: '#4a1d3f',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '14px',
                      textTransform: 'none',
                      borderRadius: '22px',
                      px: 3,
                      py: 1,
                      '&:hover': { 
                        backgroundColor: '#3a162f'
                      }
                    }}
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                      } else {
                        onOpenCreateListing();
                      }
                    }}
                  >
                    Add Listing
                  </Button>
                  <IconButton 
                    onClick={handleMenu} 
                    sx={{ 
                      border: '1px solid #dddddd',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      '&:hover': { 
                        backgroundColor: '#f7f7f7'
                      }
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, fontSize: '14px' }}>
                      {user.nickname?.[0] || user.name[0]}
                    </Avatar>
                  </IconButton>
                </>
              )}
            </Box>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              
              <IconButton
                onClick={handleMobileMenu}
                sx={{ 
                  color: '#222222',
                  '&:hover': { backgroundColor: '#f7f7f7' }
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {/* Desktop User Menu */}
          {!isMobile && user && (
            <Menu 
              anchorEl={anchorEl} 
              open={Boolean(anchorEl)} 
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: '12px',
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.12)',
                  border: '1px solid #dddddd'
                }
              }}
            >
              <MenuItem 
                onClick={() => { handleClose(); navigate('/profile'); }}
                sx={{ 
                  fontSize: '14px',
                  fontWeight: 500,
                  py: 1.5
                }}
              >
                Profile
              </MenuItem>
              <MenuItem 
                onClick={() => { handleClose(); logout(); }}
                sx={{ 
                  fontSize: '14px',
                  fontWeight: 500,
                  py: 1.5
                }}
              >
                Log out
              </MenuItem>
            </Menu>
          )}

          {/* Mobile Menu */}
          {isMobile && (
            <Menu 
              anchorEl={mobileMenuAnchor} 
              open={Boolean(mobileMenuAnchor)} 
              onClose={handleMobileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: '12px',
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.12)',
                  border: '1px solid #dddddd',
                  minWidth: 200
                }
              }}
            >
              {!user ? (
                <>
                  <MenuItem 
                    onClick={() => { handleMobileMenuClose(); navigate('/login'); }}
                    sx={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      py: 1.5
                    }}
                  >
                    Log in
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleMobileMenuClose(); navigate('/register'); }}
                    sx={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      py: 1.5
                    }}
                  >
                    Sign up
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem 
                    onClick={() => { handleMobileMenuClose(); navigate('/messages'); }}
                    sx={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      py: 1.5
                    }}
                  >
                    Messages
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleMobileMenuClose(); navigate('/my-listings'); }}
                    sx={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      py: 1.5
                    }}
                  >
                    My Listings
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleMobileMenuClose(); navigate('/loans'); }}
                    sx={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      py: 1.5
                    }}
                  >
                    Loans
                  </MenuItem>
                  {user.is_admin && (
                    <MenuItem 
                      onClick={() => { handleMobileMenuClose(); navigate('/admin'); }}
                      sx={{ 
                        fontSize: '14px',
                        fontWeight: 500,
                        py: 1.5
                      }}
                    >
                      Admin
                    </MenuItem>
                  )}
                  <MenuItem 
                    onClick={() => { 
                      handleMobileMenuClose(); 
                      onOpenCreateListing(); 
                    }}
                    sx={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      py: 1.5
                    }}
                  >
                    Add Listing
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleMobileMenuClose(); navigate('/profile'); }}
                    sx={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      py: 1.5
                    }}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleMobileMenuClose(); logout(); }}
                    sx={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      py: 1.5
                    }}
                  >
                    Log out
                  </MenuItem>
                </>
              )}
            </Menu>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

function App() {
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const handleOpenCreateListing = () => {
    if (!user) return;
    setCreateModalOpen(true);
  };
  const handleCloseCreateListing = () => setCreateModalOpen(false);
  const handleCreateSuccess = (listingId) => {
    setCreateModalOpen(false);
    if (listingId) {
      navigate(`/listings/${listingId}`);
    }
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar onOpenCreateListing={handleOpenCreateListing} />
      <CreateListingModal open={createModalOpen} onClose={handleCloseCreateListing} onSuccess={handleCreateSuccess} />
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetails />} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/messages/:userId" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
            <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
            <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter;
