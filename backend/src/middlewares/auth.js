const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user');
dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'changeme';

async function authMiddleware(req, res, next) {
  console.log('AUTH MIDDLEWARE - Method:', req.method, 'Path:', req.path);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('AUTH FAILED: Missing or invalid Authorization header');
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    
    // Si le token ne contient pas le nom (anciens tokens), le récupérer de la DB
    if (!payload.name && payload.id) {
      const user = await User.findByPk(payload.id, { attributes: ['id', 'name', 'email', 'role'] });
      if (user) {
        req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
      } else {
        req.user = payload;
      }
    } else {
      req.user = payload; // payload should contain id, role, email, and name
    }
    
    console.log('AUTH SUCCESS: User ID', req.user.id, 'Name:', req.user.name);
    next();
  } catch (err) {
    console.log('AUTH FAILED: Invalid token', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = authMiddleware;
