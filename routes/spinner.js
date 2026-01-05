const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../models/User'); // Checking how auth is middleware usually imported. Usually it's a middleware function.
// Checking `routes/investments.js` or `routes/auth.js` to see middleware usage.
// Assuming a middleware exists. I'll check `server/routes/auth.js` or `server/index.js` to confirm middleware path first.
// Wait, I should double check middleware location.
// In previous Context, `server/routes/auth.js` was just routes.
// I'll assume standard middleware or check `server/index.js` quickly.
// Actually, looking at file list, there is no separate middleware file visible in root of `server`.
// It might be in `server/middleware/auth.js` if it existed?
// Let me look at `investments.js` to see how it protects routes.

const jwt = require('jsonwebtoken');

// Middleware to verify token (Inline for now if I can't find it, but better to reuse)
const verifyToken = (req, res, next) => {
    let token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Prize Configuration
const PRIZES = [
    { value: 15, label: '15', winnable: false },
    { value: 0.2, label: '0.2', winnable: true },
    { value: 0.3, label: '0.3', winnable: true },
    { value: 0.01, label: '0.01', winnable: true },
    { value: 0.1, label: '0.1', winnable: true },
    { value: 0.01, label: '0.01', winnable: true },
    { value: 0.02, label: '0.02', winnable: true },
    { value: 0.05, label: '0.05', winnable: true },
    { value: 5, label: '5', winnable: false },
    { value: 0.075, label: '0.075', winnable: true },
    { value: 3, label: '3', winnable: false },
    { value: 0.004, label: '0.004', winnable: true },
    { value: 0.01, label: '0.01', winnable: true },
    { value: 8, label: '8', winnable: false },
    { value: 0.012, label: '0.012', winnable: true }
];

const SPIN_COST = 0.1;

// POST /spin
router.post('/spin', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.balance < SPIN_COST) {
            return res.status(400).json({ error: 'Insufficient balance ($0.10 required)' });
        }

        // Deduct cost
        const balanceBeforeCost = user.balance;
        user.balance -= SPIN_COST;
        const balanceAfterCost = user.balance;

        // Log Check Cost Transaction
        await new Transaction({
            user_id: user._id,
            type: 'lucky_spin_cost',
            amount: -SPIN_COST,
            status: 'completed',
            balance_before: balanceBeforeCost,
            balance_after: balanceAfterCost,
            description: 'Lucky Wheel Spin Cost'
        }).save();

        // Determine Prize
        // Filter winnable prizes
        const winnablePrizes = PRIZES.map((p, index) => ({ ...p, originalIndex: index })).filter(p => p.winnable);

        // Simple random selection from winnable pool
        // We could weigh this, but for now uniform random among winnable is fine
        const winningPrize = winnablePrizes[Math.floor(Math.random() * winnablePrizes.length)];

        const winAmount = winningPrize.value;

        // Credit Win
        const balanceBeforeWin = user.balance;
        user.balance += winAmount;
        const balanceAfterWin = user.balance;

        // Log Win Transaction
        await new Transaction({
            user_id: user._id,
            type: 'lucky_spin_win',
            amount: winAmount,
            status: 'completed',
            balance_before: balanceBeforeWin,
            balance_after: balanceAfterWin,
            description: `Won ${winAmount} on Lucky Wheel`
        }).save();

        await user.save();

        res.json({
            success: true,
            prizeIndex: winningPrize.originalIndex,
            winAmount: winAmount,
            newBalance: user.balance
        });

    } catch (error) {
        console.error('Spin error:', error);
        res.status(500).json({ error: 'Spin failed' });
    }
});

// GET /history (For Admin or User)
router.get('/history', verifyToken, async (req, res) => {
    try {
        const { isAdmin } = req.user; // Assuming token has role/id
        // Actually verifyToken just decodes. Need to check user role if valid.
        // For brevity, allowing users to see their own, admin to see all if query param?
        // Let's just return all for admin, own for user.

        // Check if user is admin from DB to be safe
        const requestUser = await User.findById(req.user.id || req.user._id);

        let query = { type: { $in: ['lucky_spin_win', 'lucky_spin_cost'] } };

        if (requestUser.role !== 'admin') {
            query.user_id = requestUser._id;
        } else if (req.query.userId) {
            // Admin filtering by specific user
            query.user_id = req.query.userId;
        }

        const transactions = await Transaction.find(query)
            .populate('user_id', 'full_name email')
            .sort({ created_at: -1 })
            .limit(100);

        res.json(transactions);
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

module.exports = router;
