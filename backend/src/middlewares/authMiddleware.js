import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - Verifies the JWT and fetches the user
export const protect = async (req, res, next) => {
  let token;

  // Read the JWT from the 'jwt' cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      // Decode the token using the secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from the database (exclude the password)
      req.user = await User.findById(decoded.userId).select('-password');

      // Check if the user was deleted or deactivated after the token was issued
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists' });
      }
      if (!req.user.isActive) {
        return res.status(403).json({ message: 'Not authorized, account deactivated' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Role-Based Access Control (RBAC)
// Accepts an array of allowed roles: authorize('ClinicAdmin', 'Receptionist')
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: User role '${req.user?.role}' is not authorized to access this route.` 
      });
    }
    next();
  };
};