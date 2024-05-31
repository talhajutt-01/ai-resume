// User.js

const express = require('express');
const router = express.Router();

// Import your controller functions
const { getUserTokensByEmail } = require('../controllers/userController');

// Define your routes
router.get('/:email/tokens', getUserTokensByEmail);

module.exports = router;
