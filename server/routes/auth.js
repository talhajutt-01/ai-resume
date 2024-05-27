const express = require('express');
const { validationResult, check } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = "ILOVECODING";

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
      const secpass = await bcrypt.hash(req.body.password, salt);

      // Create a new user
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: secpass,
      });

      // Save the user to the database
      await newUser.save();

      const data = {
        id: newUser.id,
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.status(201).json({ authtoken: authtoken, message: 'User registered successfully' });

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
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ errors: "Please try to login with correct details" });
      }

      const passcompare = await bcrypt.compare(password, user.password);
      if (!passcompare) {
        return res.status(404).json({ errors: "Please try to login with correct details" });
      }

      const data = {
        id: user.id,
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.status(201).json({ authtoken: authtoken, message: 'User login successfully' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
