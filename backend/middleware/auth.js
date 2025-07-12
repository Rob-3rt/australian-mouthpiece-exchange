const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
  console.log('Auth middleware called for URL:', req.url);
  console.log('Auth middleware called for method:', req.method);
  console.log('Auth middleware headers:', req.headers);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided for URL:', req.url);
    return res.status(401).json({ error: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}; 