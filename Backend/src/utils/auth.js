const jwt = require('jsonwebtoken');

const JWT_SECRET =
  process.env.JWT_SECRET || 'TtwEOeNGvbNnZZ0Dp6ksimcLUcd42PKu9YEq5FF6nYP';
const JWT_EXPIRY = '15m';
const JWT_REFRESH_EXPIRY = '7d';

const generateToken = (user) => {
  try {
    const token = jwt.sign({sub: user.user_id, email: user.email}, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    const refreshToken = jwt.sign(
      {sub: user.user_id, email: user.email, type: 'refresh'},
      JWT_SECRET,
      {
        expiresIn: JWT_REFRESH_EXPIRY,
      }
    );

    return {token, refreshToken};
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  generateToken,
  JWT_SECRET,
  JWT_EXPIRY,
  JWT_REFRESH_EXPIRY,
};
