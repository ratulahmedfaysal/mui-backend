const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No authentication token, access denied' });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) {
            return res.status(401).json({ error: 'Token verification failed, authorization denied' });
        }

        const user = await User.findById(verified.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user._id; // Keep as ID for compatibility with existing routes
        req.role = user.role; // Use role from DB, not token
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = auth;
