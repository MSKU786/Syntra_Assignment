const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {User} = require('../models/');
const authRoutes = express.Router();

const JWT_EXPIRY = '2h';
const saltRounds = 10;
const JWT_SECRET =
  process.env.JWT_SECRET || 'TtwEOeNGvbNnZZ0Dp6ksimcLUcd42PKu9YEq5FF6nYP';

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

    const token = jwt.sign({sub: user.user_id, email: user.email}, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    res.status(201).json({
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Sever error',
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

    const token = jwt.sign({sub: user.user_id, email: user.email}, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    res.status(200).json({
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Sever error',
    });
  }
});

module.exports = {authRoutes};
