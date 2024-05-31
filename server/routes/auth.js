const express = require('express');
const { validationResult, check } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = "ILOVECODING";

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id, 'tokens.token': token });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

router.post(
  '/signup',
  [
    check('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    check('email').isEmail().withMessage('Invalid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if the email already exists
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const salt = await bcrypt.genSaltSync(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Create a new user
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });

      // Save the user to the database
      await newUser.save();

      // Generate JWT token
      const token = jwt.sign({ id: newUser.id }, JWT_SECRET);

      res.status(201).json({ token, message: 'User registered successfully' });

    } catch (error) {
      console.error(error);

      // Additional error handling
      if (error.name === 'ValidationError') {
        return res.status(400).json({ errors: [{ msg: 'Validation error', param: error.path }] });
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Invalid email'),
    check('password').exists().withMessage('Password Cannot be blank'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ errors: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(404).json({ errors: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id }, JWT_SECRET);

      res.status(201).json({ token, message: 'User login successfully' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/current', authenticateUser, async (req, res) => {
  try {
    const user = req.user; // User object is available from the middleware
    res.status(200).json({ userId: user._id, tokens: user.tokens });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;
