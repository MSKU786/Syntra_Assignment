const jwt = require('jsonwebtoken');
const {User} = require('../models');

const authMiddlware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log('Auth header', authHeader);

  if (!authHeader) {
    return res.status(401).json({
      message: 'Missing authorization header',
    });
  }

  const token = authHeader.split(' ')[1];

  console.log(token);

  if (!token) {
    return res.status(401).json({
      message: 'Invalid Token',
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log(payload);
    const user = await User.findByPk(payload.sub);
    console.log('000000', user);
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
    console.log('000000', req.user);
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid or expire token',
    });
  }
};

module.exports = authMiddlware;
