const jwt = require('jsonwebtoken');
const {User} = require('../models');
const {JWT_SECRET} = require('../utils/auth');

const authMiddlware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Missing authorization header',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Invalid Token',
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Ensure it's not a refresh token
    if (payload.type === 'refresh') {
      return res.status(401).json({
        message: 'Invalid token type. Access token required.',
      });
    }

    const user = await User.findByPk(payload.sub);

    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    req.user = {
      id: user.user_id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};

module.exports = authMiddlware;
