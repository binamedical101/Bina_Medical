import jwt from 'jsonwebtoken';

const generateToken = (res, userId, sessionId) => {
  const token = jwt.sign({ userId, sessionId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  // Set JWT as HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none', // Allow cross-origin cookies in production
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};

export default generateToken;
