const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');

let io;

// Store online users
const onlineUsers = new Map(); // userId -> socketId

// Initialize Socket.IO
function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://australian-mouthpiece-exchange.vercel.app'
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware - allow initial connection, authenticate later
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      // Allow connection but mark as unauthenticated
      socket.userId = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      // Allow connection but mark as unauthenticated
      socket.userId = null;
      next();
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    if (socket.userId) {
      console.log(`User ${socket.userId} connected`);
      // Add user to online users
      onlineUsers.set(socket.userId, socket.id);
    } else {
      console.log('Unauthenticated user connected');
    }

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        console.log(`User ${socket.userId} disconnected`);
        onlineUsers.delete(socket.userId);
      } else {
        console.log('Unauthenticated user disconnected');
      }
    });

    // Handle user joining a conversation
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation-${conversationId}`);
    });

    // Handle user leaving a conversation
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation-${conversationId}`);
    });
  });

  return io;
}

// Send notification to a specific user
function sendNotificationToUser(userId, notification) {
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
    return true;
  }
  return false; // User is offline
}

// Send message notification to conversation participants
function sendMessageNotification(message, sender, recipient, listing = null) {
  const notification = {
    type: 'new_message',
    message: {
      id: message.message_id,
      content: message.content,
      timestamp: message.timestamp,
      from_user: sender,
      listing: listing
    }
  };

  // Send to recipient if online
  const recipientOnline = sendNotificationToUser(recipient.user_id, notification);
  
  // Also emit to conversation room for real-time updates
  const conversationId = `${sender.user_id}_${recipient.user_id}`;
  io.to(`conversation-${conversationId}`).emit('new_message', notification.message);

  return recipientOnline;
}

// Get online status of users
function getOnlineStatus(userIds) {
  const status = {};
  userIds.forEach(userId => {
    status[userId] = onlineUsers.has(userId);
  });
  return status;
}

// Get number of online users
function getOnlineUserCount() {
  return onlineUsers.size;
}

module.exports = {
  initializeSocket,
  sendNotificationToUser,
  sendMessageNotification,
  getOnlineStatus,
  getOnlineUserCount,
}; 