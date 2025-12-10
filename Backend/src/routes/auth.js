const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {User} = require('../models/');
const authMiddlware = require('../middleware/auth');
const {generateToken, JWT_SECRET} = require('../utils/auth');
const {addToBlacklist, isBlacklisted} = require('../utils/tokenBlacklist');
const authRoutes = express.Router();

const saltRounds = 10;

authRoutes.post('/register', async (req, res) => {
  const {email, password, name, role} = req.body;

  if (!email && !password) {
    return res.status(400).json({message: 'Need email and password'});
  }

  try {
    const existingUser = await User.findOne({
      where: {email},
    });

    if (existingUser) {
      return res.status(400).json({message: 'Email ALready exist'});
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      email,
      passwordHash,
      name,
      role: role || 'reporter',
    });

    const {token, refreshToken} = generateToken(user);

    res.status(201).json({
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Sever error',
    });
  }
});

authRoutes.post('/logout', authMiddlware, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : null;

    // Get refresh token from body or header
    const {refreshToken} = req.body;

    // Blacklist the refresh token if provided
    if (refreshToken) {
      try {
        // Verify the refresh token is valid before blacklisting
        jwt.verify(refreshToken, JWT_SECRET);
        addToBlacklist(refreshToken);
      } catch (err) {
        // If refresh token is invalid, continue with logout anyway
        console.log('Invalid refresh token during logout:', err.message);
      }
    }

    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Server error',
    });
  }
});

authRoutes.post('/refresh-token', async (req, res) => {
  try {
    // Get refresh token from body or Authorization header
    let refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        refreshToken = authHeader.split(' ')[1];
      }
    }

    if (!refreshToken) {
      return res.status(401).json({
        message: 'Refresh token is required',
      });
    }

    // Check if token is blacklisted
    if (isBlacklisted(refreshToken)) {
      return res.status(401).json({
        message: 'Refresh token has been revoked',
      });
    }

    // Verify the refresh token
    let payload;
    try {
      payload = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: 'Invalid or expired refresh token',
      });
    }

    // Check if it's actually a refresh token (has type: 'refresh')
    if (payload.type !== 'refresh') {
      return res.status(401).json({
        message: 'Invalid token type',
      });
    }

    // Find the user
    const user = await User.findByPk(payload.sub);
    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    // Generate new tokens
    const {token, refreshToken: newRefreshToken} = generateToken(user);

    // Optionally blacklist the old refresh token (one-time use)
    // For better security, uncomment the line below to enforce one-time use
    // addToBlacklist(refreshToken);

    res.status(200).json({
      token,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Server error',
    });
  }
});

authRoutes.post('/login', async (req, res) => {
  const {email, password} = req.body;

  if (!email && !password) {
    return res.status(400).json({message: 'Need email and password'});
  }

  try {
    const user = await User.findOne({
      where: {email},
    });

    if (!user) {
      return res.status(400).json({message: 'Invalid Credentials'});
    }

    const passwordCheck = await bcrypt.compare(password, user.passwordHash);

    if (!passwordCheck) {
      return res.status(400).json({message: 'Invalid Credentials'});
    }

    const {token, refreshToken} = generateToken(user);

    res.status(200).json({
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Sever error',
    });
  }
});

module.exports = {authRoutes};
