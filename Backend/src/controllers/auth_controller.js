const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {User} = require('../models/');
const {generateToken, JWT_SECRET} = require('../utils/auth');
const {addToBlacklist, isBlacklisted} = require('../utils/tokenBlacklist');

const saltRounds = 10;

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 6 characters, can include letters, numbers, and special characters
  return password && password.length >= 6;
};

/**
 * Register a new user
 */
const register = async (req, res) => {
  const {email, password, name, role} = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
      errors: {
        email: !email ? 'Email is required' : undefined,
        password: !password ? 'Password is required' : undefined,
      },
    });
  }

  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).json({
      message: 'Invalid email format',
      errors: {
        email: 'Please enter a valid email address',
      },
    });
  }

  // Validate password strength
  if (!validatePassword(password)) {
    return res.status(400).json({
      message: 'Password does not meet requirements',
      errors: {
        password: 'Password must be at least 6 characters long',
      },
    });
  }

  try {
    const existingUser = await User.findOne({
      where: {email: email.toLowerCase().trim()},
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists',
        errors: {
          email: 'An account with this email already exists',
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name?.trim() || null,
      role: role || 'reporter',
    });

    const {token, refreshToken} = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      refreshToken,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      message: 'Server error. Please try again later.',
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  const {email, password} = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
      errors: {
        email: !email ? 'Email is required' : undefined,
        password: !password ? 'Password is required' : undefined,
      },
    });
  }

  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).json({
      message: 'Invalid email format',
      errors: {
        email: 'Please enter a valid email address',
      },
    });
  }

  try {
    const user = await User.findOne({
      where: {email: email.toLowerCase().trim()},
    });

    // Use the same error message for both invalid email and password
    // to prevent user enumeration attacks
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const passwordCheck = await bcrypt.compare(password, user.passwordHash);

    if (!passwordCheck) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const {token, refreshToken} = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      refreshToken,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      message: 'Server error. Please try again later.',
    });
  }
};

/**
 * Logout user (blacklist refresh token)
 */
const logout = async (req, res) => {
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
    console.error('Logout error:', err);
    res.status(500).json({
      message: 'Server error. Please try again later.',
    });
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshToken = async (req, res) => {
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
    console.error('Refresh token error:', err);
    res.status(500).json({
      message: 'Server error. Please try again later.',
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
