const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { execSync } = require('child_process');

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Run database migrations on startup
async function runMigrations() {
  try {
    console.log('Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Failed to run migrations:', error);
    // Don't exit the process, just log the error
  }
}

// Initialize Socket.IO
const socketService = require('./utils/socketService');
socketService.initializeSocket(server);

app.use(cors({
  origin: [
    'https://www.mouthpieceexchange.org',
    'https://mouthpieceexchange.org',
    'https://australian-mouthpiece-exchange.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // Cache preflight requests for 24 hours
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'The Australian Mouthpiece Exchange API is running.' });
});

// TODO: Import and use modular routes here
// Example: app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/moderation', require('./routes/moderation'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/analytics', require('./routes/adminAnalytics'));
app.use('/api/loans', require('./routes/loans'));

// Global error handler for CORS and other errors
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    console.error('CORS error:', req.headers.origin);
    res.status(403).json({ error: 'CORS error: Origin not allowed', origin: req.headers.origin });
  } else {
    next(err);
  }
});

// Start server after running migrations
async function startServer() {
  await runMigrations();
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
