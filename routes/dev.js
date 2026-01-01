const router = require('express').Router();
const User = require('../models/User');

// Make a user an admin by email
router.get('/make-admin/:email', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { email: req.params.email },
            { role: 'admin' },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
