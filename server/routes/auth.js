const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { store } = require('../store');

const router = express.Router();

// Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists
        const existingUser = store.findOne('users', (u) => u.email === email.toLowerCase());
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = store.insert('users', {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || 'candidate',
            skills: [],
            bio: ''
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = store.findOne('users', (u) => u.email === email.toLowerCase());
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id, user.role);

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = store.findById('users', decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(401).json({ message: 'Not authorized' });
    }
});

module.exports = router;
