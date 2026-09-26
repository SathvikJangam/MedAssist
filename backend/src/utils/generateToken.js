import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token lasts for 30 days
  });

  const isProduction = process.env.NODE_ENV === 'production';

  // Set JWT as HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction, // Use secure cookies in production (HTTPS)
    sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-domain Vercel <-> Render
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

export default generateToken;