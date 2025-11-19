const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'changeme';

function authMiddleware(req, res, next) {
  console.log('AUTH MIDDLEWARE - Method:', req.method, 'Path:', req.path);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('AUTH FAILED: Missing or invalid Authorization header');
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload; // payload should contain id and role
    console.log('AUTH SUCCESS: User ID', payload.id);
    next();
  } catch (err) {
    console.log('AUTH FAILED: Invalid token', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = authMiddleware;
