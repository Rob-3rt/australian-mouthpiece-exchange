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
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://australian-mouthpiece-exchange.vercel.app',
      'https://australian-mouthpiece-exchange.vercel.app/'
    ];
    
    // Add the FRONTEND_URL from environment if it exists
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
      // Also add without trailing slash
      if (process.env.FRONTEND_URL.endsWith('/')) {
        allowedOrigins.push(process.env.FRONTEND_URL.slice(0, -1));
      } else {
        allowedOrigins.push(process.env.FRONTEND_URL + '/');
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Start server after running migrations
async function startServer() {
  await runMigrations();
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
