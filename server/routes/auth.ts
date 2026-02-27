// Import necessary modules
const express = require('express');
const router = express.Router();
const { connectDB } = require('../utils/db');

// Connect to database once
connectDB();

/**
 * @description Authentication routes
 * @emailIndex This index is used to efficiently query users by their email addresses.
 */

// Example route for user registration
router.post('/register', async (req, res) => {
    try {
        // Registration logic here
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Registration failed' });
    }
});

// Export the router
module.exports = router;