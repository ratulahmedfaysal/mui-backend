const router = require('express').Router();
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const auth = require('../middleware/auth');

// Create Deposit (User)
router.post('/deposits', auth, async (req, res) => {
    try {
        const { payment_method_id, amount, fee, final_amount, transaction_data, status, gateway_transaction_id } = req.body;

        const deposit = new Deposit({
            user_id: req.user, // auth middleware attaches user id to req.user
            payment_method_id,
            amount,
            fee,
            final_amount,
            transaction_data,
            status: status || 'pending',
            gateway_transaction_id
        });

        await deposit.save();

        // Create Transaction Record (Pending)
        const User = require('../models/User');
        const user = await User.findById(req.user);
        const currentBalance = user ? user.balance : 0;

        const Transaction = require('../models/Transaction');
        await new Transaction({
            user_id: req.user,
            type: 'deposit',
            amount: final_amount, // or amount? Usually user sees the amount they get or pay? final_amount is usually what enters system.
            balance_before: currentBalance,
            balance_after: currentBalance, // No change yet
            description: 'Deposit request',
            status: 'pending',
            reference_id: deposit._id
        }).save();
        res.status(201).json(deposit);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Create Withdrawal (User)
router.post('/withdrawals', auth, async (req, res) => {
    try {
        const { payment_method_id, amount, fee, final_amount, transaction_data } = req.body;

        // Check balance
        const User = require('../models/User');
        const user = await User.findById(req.user);
        if (user.balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Deduct balance immediately
        user.balance -= amount;
        await user.save();

        const withdrawal = new Withdrawal({
            user_id: req.user,
            payment_method_id,
            amount,
            fee,
            final_amount,
            transaction_data,
            status: 'pending'
        });

        await withdrawal.save();

        const Transaction = require('../models/Transaction');
        await new Transaction({
            user_id: req.user,
            type: 'withdrawal',
            amount,
            balance_before: user.balance + amount, // Balance before deduction
            balance_after: user.balance, // Current balance (deducted)
            description: 'Withdrawal request',
            status: 'pending',
            reference_id: withdrawal._id
        }).save();
        res.status(201).json(withdrawal);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
