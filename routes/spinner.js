const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const SpinRecord = require('../models/SpinRecord');
const auth = require('../models/User'); // Legacy import for auth? Need valid auth
// Using the inline verifyToken for now as per existing file structure 

const jwt = require('jsonwebtoken');

// Middleware to verify token
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

        // Log Check Cost Transaction (Keeping for ledger integrity)
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

        // Simple random selection
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

        // --- NEW: Save Consolidated SpinRecord ---
        await new SpinRecord({
            user_id: user._id,
            cost: SPIN_COST,
            win_amount: winAmount,
            profit_loss: winAmount - SPIN_COST
        }).save();
        // -----------------------------------------

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

// GET /records (New Endpoint for Spin History)
router.get('/records', verifyToken, async (req, res) => {
    try {
        const requestUser = await User.findById(req.user.id || req.user._id);

        let query = {};

        // If not admin, restrict to own data
        if (requestUser.role !== 'admin') {
            query.user_id = requestUser._id;
        } else if (req.query.userId) {
            // Admin filtering by specific user
            query.user_id = req.query.userId;
        }

        const records = await SpinRecord.find(query)
            .populate('user_id', 'full_name email')
            .sort({ created_at: -1 })
            .limit(100);

        // Calculate Stats
        // We can do an aggregate for fast stats, but for 100 limit just summing js is fine for display
        // However, for total stats OF ALL TIME, we should verify specific usage.
        // User asked for "total cost in spins and total wins".
        // Let's do a separate aggregation for stats to be accurate across ALL history, not just the limit 100.

        const stats = await SpinRecord.aggregate([
            { $match: query }, // Apply same filter
            {
                $group: {
                    _id: null,
                    totalCost: { $sum: '$cost' },
                    totalWin: { $sum: '$win_amount' },
                    totalSpins: { $sum: 1 }
                }
            }
        ]);

        const statResult = stats.length > 0 ? stats[0] : { totalCost: 0, totalWin: 0, totalSpins: 0 };

        res.json({
            records,
            stats: statResult
        });

    } catch (error) {
        console.error('Records error:', error);
        res.status(500).json({ error: 'Failed to fetch spin records' });
    }
});

module.exports = router;
