const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users
router.get('/', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const users = await User.find().sort({ created_at: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const bcrypt = require('bcryptjs'); // Add bcrypt

// Update user (Ban/Unban/Activate/Password)
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const { is_active, is_banned, balance, password } = req.body;
        const update = {};
        if (typeof is_active !== 'undefined') update.is_active = is_active;
        if (typeof is_banned !== 'undefined') update.is_banned = is_banned;
        if (typeof balance !== 'undefined') update.balance = balance;

        // Handle Password Update
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt();
            update.password = await bcrypt.hash(password, salt);
        }
        const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
