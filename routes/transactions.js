const router = require('express').Router();
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const auth = require('../middleware/auth');

const Transaction = require('../models/Transaction');

// Get All Transactions (User/Admin)
router.get('/', auth, async (req, res) => {
    try {
        const query = req.role === 'admin' ? {} : { user_id: req.user };
        const transactions = await Transaction.find(query).sort({ created_at: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Deposits
router.get('/deposits', auth, async (req, res) => {
    try {
        const query = req.role === 'admin' ? {} : { user_id: req.user };

        const deposits = await Deposit.find(query)
            .populate('user_id', 'email full_name username')
            .populate('payment_method_id', 'method_name currency_name')
            .sort({ created_at: -1 });



        res.json(deposits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Deposit (Approve/Reject)
router.put('/deposits/:id', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const deposit = await Deposit.findById(req.params.id);
        if (!deposit) return res.status(404).json({ error: 'Deposit not found' });

        // Prevent double approval
        if (deposit.status === 'approved' && req.body.status === 'approved') {
            return res.status(400).json({ error: 'Deposit already approved' });
        }

        const updatedDeposit = await Deposit.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (req.body.status === 'approved') {
            const User = require('../models/User');
            const Transaction = require('../models/Transaction');
            const ReferralSettings = require('../models/ReferralSettings');
            const UserReferral = require('../models/UserReferral');

            // 1. Get current balance (before update)
            const userBefore = await User.findById(deposit.user_id);
            const balanceBefore = userBefore ? userBefore.balance : 0;

            // 2. Add balance to user
            const userAfter = await User.findByIdAndUpdate(deposit.user_id, { $inc: { balance: deposit.final_amount } }, { new: true });
            const balanceAfter = userAfter ? userAfter.balance : (balanceBefore + deposit.final_amount);

            // 3. Create Transaction Log for User
            await new Transaction({
                user_id: deposit.user_id,
                type: 'deposit',
                amount: deposit.final_amount,
                description: 'Deposit approved',
                status: 'approved',
                balance_before: balanceBefore,
                balance_after: balanceAfter
            }).save();

            // 3. Distribute Commissions
            const settings = await ReferralSettings.find({ system_type: 'deposit', is_active: true }).sort({ level_number: 1 });

            // Find uplines
            // recursive or iterative? simplified iterative for 3 levels
            let currentUserId = deposit.user_id;

            for (const setting of settings) {
                // Find referrer of currentUserId
                // UserReferral model: referrer_id, referred_user_id.
                // Find where referred_user_id == currentUserId (direct upline)
                // Wait, UserReferral usually stores direct relationship? 
                // My model: referrer_id, referred_user_id, level. 
                // Actually "level" might be relative to root? or relative to referrer?
                // Usually UserReferral is just (referrer, referred).
                // My `UserReferral` model had `level`. If `level` is always 1 (direct), then I need to walk up chain.

                const referral = await UserReferral.findOne({ referred_user_id: currentUserId, level: 1 });
                if (!referral) break; // No upline

                const referrerId = referral.referrer_id;
                const commissionAmount = (deposit.final_amount * setting.commission_percentage) / 100;

                if (commissionAmount > 0) {
                    // Add balance toreferrer
                    await User.findByIdAndUpdate(referrerId, { $inc: { balance: commissionAmount } });

                    // Log Commission Transaction
                    await new Transaction({
                        user_id: referrerId,
                        type: 'referral_bonus',
                        amount: commissionAmount,
                        description: `Deposit bonus from level ${setting.level_number} referral`,
                        status: 'approved',
                        // balance_after... skip for speed
                    }).save();

                    // Update UserReferral stats? commission_earned?
                    await UserReferral.findOneAndUpdate(
                        { referrer_id: referrerId, referred_user_id: currentUserId }, // This is specifically for this pair
                        // actually we want to update the referrer's total earnings potentially?
                        // My model has `commission_earned` on UserReferral. Maybe correct.
                        { $inc: { commission_earned: commissionAmount } }
                    );
                }

                // Move up
                currentUserId = referrerId;
            }
        }

        res.json(updatedDeposit);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// Get Withdrawals
router.get('/withdrawals', auth, async (req, res) => {
    try {
        const query = req.role === 'admin' ? {} : { user_id: req.user };
        const withdrawals = await Withdrawal.find(query)
            .populate('user_id', 'email full_name username balance')
            .populate('payment_method_id', 'method_name currency_name')
            .sort({ created_at: -1 });
        res.json(withdrawals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Withdrawal (Approve/Reject)
router.put('/withdrawals/:id', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ error: 'Withdrawal already processed' });
        }

        const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Update linked transaction status
        const Transaction = require('../models/Transaction');
        await Transaction.findOneAndUpdate({ reference_id: req.params.id }, { status: req.body.status });

        if (req.body.status === 'rejected') {
            // Refund balance
            const User = require('../models/User');

            await User.findByIdAndUpdate(withdrawal.user_id, { $inc: { balance: withdrawal.amount } }); // Refund amount (fee included? usually amount is total deducted)

            // Log Refund Transaction
            await new Transaction({
                user_id: withdrawal.user_id,
                type: 'deposit', // or 'refund'
                amount: withdrawal.amount,
                description: 'Withdrawal rejected - refunded',
                status: 'approved',
                balance_before: (await User.findById(withdrawal.user_id)).balance - withdrawal.amount,
                balance_after: (await User.findById(withdrawal.user_id)).balance
            }).save();
        }

        res.json(updatedWithdrawal);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin Manual Balance Adjustment
router.post('/admin/adjust-balance', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const { user_id, amount, type, description } = req.body;
        const User = require('../models/User');
        const Transaction = require('../models/Transaction');

        const user = await User.findById(user_id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const balance_before = user.balance;
        let new_balance = balance_before;

        if (type === 'deposit' || type === 'add') {
            new_balance += parseFloat(amount);
        } else if (type === 'withdrawal' || type === 'deduct') {
            new_balance -= parseFloat(amount);
        }

        user.balance = new_balance;
        await user.save();

        const transaction = new Transaction({
            user_id,
            type: type === 'add' ? 'deposit' : 'withdrawal', // Store as standard types or specific 'adjustment'
            amount: parseFloat(amount),
            balance_before,
            balance_after: new_balance,
            description: description || 'Admin adjustment',
            status: 'approved'
        });
        await transaction.save();

        res.json({ user, transaction });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
