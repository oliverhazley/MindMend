import jwt from 'jsonwebtoken';
import 'dotenv/config';

/**
 * Authentication middleware to verify JWT token
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({message: 'Access denied. No token provided.'});
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res
        .status(401)
        .json({message: 'Access denied. No token provided.'});
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user to request object
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({message: 'Invalid token.'});
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({message: 'Token expired.'});
    }

    console.error('Authentication error:', error);
    res.status(500).json({message: 'Internal Server Error'});
  }
};

export default authenticate;


