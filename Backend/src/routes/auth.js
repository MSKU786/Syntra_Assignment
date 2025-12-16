const express = require('express');
const authMiddlware = require('../middleware/auth');
const {
  register,
  login,
  logout,
  refreshToken,
} = require('../controllers/auth_controller');

const authRoutes = express.Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/logout', authMiddlware, logout);
authRoutes.post('/refresh-token', refreshToken);

module.exports = {authRoutes};
