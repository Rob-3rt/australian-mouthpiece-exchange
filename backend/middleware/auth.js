const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Only log missing token for debugging
    // console.warn('No token provided for URL:', req.url);
    return res.status(401).json({ error: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    // Only log token errors if needed
    // console.warn('Invalid or expired token for URL:', req.url);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}; 