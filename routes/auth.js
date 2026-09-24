const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateUser } = require('../middleware/auth');

// Generate JWT and set cookie
const generateTokenAndSetCookie = (res, user) => {
  const payload = { id: user._id, role: user.role, email: user.email, name: user.name };
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
  const token = jwt.sign(payload, secret, { expiresIn: '1d' });

  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    // Cross-subdomain SPA (shub → apishub) needs None in production
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  return token;
};

// Register Endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    // Determine role
    const isInternal = email.toLowerCase().endsWith('@snsgroups.com');
    const role = isInternal ? 'internal' : 'guest';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    generateTokenAndSetCookie(res, newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Determine if we are comparing a legacy plaintext password or a hashed one
    // In a real production migration, you'd update passwords. For safety, we allow legacy plaintext 
    // to still work if they match exactly, but ideally they should be reset.
    // However, the prompt says "If existing users have plaintext passwords... Handle migration carefully"
    // Let's assume all passwords should be verified with bcrypt. If it fails, we check plaintext for backward compatibility
    // and rehash it.
    let isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch && user.password === password) {
      // Legacy plaintext match - upgrade to hash
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    generateTokenAndSetCookie(res, user);

    res.status(200).json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get current user (validates cookie)
router.get('/me', authenticateUser, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Logout Endpoint
router.post('/logout', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
