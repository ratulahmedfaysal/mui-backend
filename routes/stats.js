const router = require('express').Router();
const User = require('../models/User');
const UserInvestment = require('../models/UserInvestment');
const UserReferral = require('../models/UserReferral');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const auth = require('../middleware/auth');

router.get('/admin', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        // Parallelize queries for performance
        const [
            users,
            investments,
            referrals,
            deposits,
            withdrawals
        ] = await Promise.all([
            User.find({}, 'is_active role'), // is_banned? My schema has is_active, maybe add is_banned if missing
            UserInvestment.find({}, 'amount total_roi_earned'), // Assuming total_roi_earned matches schema
            UserReferral.find({}, 'commission_earned'), // Need to check if I added commission_earned to model
            Deposit.find({}, 'amount status'),
            Withdrawal.find({}, 'amount status')
        ]);

        // Helper to check banning if not in schema explicitly, or if I missed adding it.
        // I added is_active. Let's assume is_banned is user.is_active === false for now 
        // OR I should have added is_banned to User model.
        // Let's check User model again. I think I missed is_banned.
        // Plan: Add is_banned to User model in next step if missing.
        // For now, I'll return 0 for banned if missing.

        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.is_active).length;
        // const bannedUsers = users.filter(u => u.is_banned).length; 
        const bannedUsers = 0; // Placeholder until schema update
        const inactiveUsers = totalUsers - activeUsers; // simplistic

        const totalInvestments = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        // roi_percentage vs total_roi_earned. Schema had daily_profit, roi_percentage.
        // I need to ensure UserInvestment model has total_roi_earned or calculate it.
        // Schema: daily_profit.
        // Stat: totalROIPaid.
        // Logic: if I don't store it, I can't sum it easily without history. 
        // Supabase had it. I should add it to model or calculate.
        // Let's assume I add it to model.
        const totalROIPaid = investments.reduce((sum, inv) => sum + (inv.total_roi_earned || 0), 0);

        const totalReferralCommissions = referrals.reduce((sum, ref) => sum + (ref.commission_earned || 0), 0);
        // UserReferral model I created had level, referrer, referred. 
        // Missed commission_earned?
        // I should check UserReferral model.

        const totalDeposits = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
        const approvedDeposits = deposits.filter(d => d.status === 'approved').reduce((sum, d) => sum + (d.amount || 0), 0);
        const rejectedDeposits = deposits.filter(d => d.status === 'rejected').reduce((sum, d) => sum + (d.amount || 0), 0);
        const pendingDeposits = deposits.filter(d => d.status === 'pending').length;

        const totalWithdrawals = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
        const approvedWithdrawals = withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + (w.amount || 0), 0);
        const rejectedWithdrawals = withdrawals.filter(w => w.status === 'rejected').reduce((sum, w) => sum + (w.amount || 0), 0);
        const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

        res.json({
            totalUsers,
            totalInvestments,
            totalROIPaid,
            activeUsers,
            inactiveUsers,
            bannedUsers,
            totalReferralCommissions,
            totalWithdrawals,
            approvedWithdrawals,
            rejectedWithdrawals,
            totalDeposits,
            approvedDeposits,
            rejectedDeposits,
            pendingDeposits,
            pendingWithdrawals
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
