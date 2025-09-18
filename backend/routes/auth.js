const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');

// Register admin user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await User.create({ username, email, password, role: role || 'admin' });
    res.status(201).json({ message: 'User registered', user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login admin user
// Login by username or email
router.post('/login', async (req, res) => {
  try {
    console.log('LOGIN ATTEMPT', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('LOGIN FAIL: missing field');
      return res.status(400).json({ error: 'Missing username/email or password' });
    }
    let user = await User.findOne({ where: { username: email } });
    if (!user) {
      user = await User.findOne({ where: { email } });
    }
    if (!user) {
      console.log('LOGIN FAIL: user not found for', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    let passwordValid = false;
    try {
      passwordValid = user.validPassword(password);
    } catch (err) {
      console.log('BCRYPT ERROR:', err);
      return res.status(500).json({ error: 'Password check error' });
    }
    if (!passwordValid) {
      console.log('LOGIN FAIL: invalid password for', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    let token;
    try {
      token = user.generateJWT();
    } catch (err) {
      console.log('JWT ERROR:', err);
      return res.status(500).json({ error: 'Token generation error' });
    }
    console.log('LOGIN SUCCESS:', user.username || user.email);
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

module.exports = router;
