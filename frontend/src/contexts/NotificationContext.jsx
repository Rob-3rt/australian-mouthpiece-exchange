import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Snackbar, Alert, Badge, IconButton, Menu, MenuItem, Typography, Box, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [anchorEl, setAnchorEl] = useState(null);
  const socketRef = useRef(null);

  // Connect to Socket.IO when user is authenticated
  useEffect(() => {
    if (user && token) {
      // Initial refresh of unread count
      refreshUnreadCount();
      
      try {
        // Use the same URL logic as the API config
        const socketUrl = (window.location.hostname === 'mouthpieceexchange.org' || 
                          window.location.hostname === 'www.mouthpieceexchange.org' ||
                          window.location.hostname === 'australian-mouthpiece-exchange.vercel.app')
          ? 'https://api.mouthpieceexchange.org'
          : 'http://localhost:4000';
        
        socketRef.current = io(socketUrl, {
          auth: { token },
          timeout: 10000,
          forceNew: true,
          transports: ['polling', 'websocket'], // Try polling first, then websocket
          upgrade: true,
          rememberUpgrade: false
        });

        socketRef.current.on('connect', () => {
          console.log('Connected to notification service');
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          // Don't disconnect on error, let it retry
          // This is normal on Render free tier
        });

        socketRef.current.on('notification', (notification) => {
          handleNewNotification(notification);
        });

        socketRef.current.on('new_message', (message) => {
          handleNewMessage(message);
        });

        socketRef.current.on('disconnect', (reason) => {
          console.log('Disconnected from notification service:', reason);
          // Don't worry about disconnections - they're expected on Render free tier
        });

        socketRef.current.on('error', (error) => {
          console.error('Socket error:', error);
          // Don't disconnect on error, let it retry
        });

        return () => {
          if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
          }
        };
      } catch (error) {
        console.error('Failed to initialize socket connection:', error);
      }
    } else {
      // Clean up socket if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }
  }, [user, token]);

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    setUnreadCount(prev => prev + 1);
    
    // Show snackbar for new messages
    if (notification.type === 'new_message') {
      const senderName = notification.message.from_user.nickname || notification.message.from_user.name;
      setSnackbar({
        open: true,
        message: `New message from ${senderName}`,
        severity: 'info'
      });
    }
  };

  const handleNewMessage = (message) => {
    // This is for real-time message updates in conversations
    // The actual notification is handled by handleNewNotification
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const joinConversation = (conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-conversation', conversationId);
    }
  };

  const refreshUnreadCount = async () => {
    try {
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Try to parse JSON, but handle HTML error pages gracefully
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const conversations = await response.json();
          const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
          setUnreadCount(totalUnread);
        } else {
          const text = await response.text();
          console.error('Unread count API did not return JSON:', text);
        }
      } else {
        const text = await response.text();
        console.error('Unread count API error:', response.status, text);
      }
    } catch (error) {
      console.error('Failed to refresh unread count:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    joinConversation,
    leaveConversation,
    refreshUnreadCount,
    handleMenuOpen,
    handleMenuClose,
    anchorEl
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Snackbar for new notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}; 