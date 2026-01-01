const router = require('express').Router();
const User = require('../models/User');
const UserInvestment = require('../models/UserInvestment');
const UserReferral = require('../models/UserReferral');
const Transaction = require('../models/Transaction'); // For withdrawals/deposits
// We can use Transaction with type=deposit/withdrawal and status=pending
// Or we can query Deposit/Withdrawal models if they are separate collections (they are not separate models in Mongoose yet? Check files.)
// Actually we have Deposit and Withdrawal models? Yes, check route files. 
// routes/transactions.js uses 'Deposit' and 'Withdrawal' models.
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const auth = require('../middleware/auth');

// Get Admin Stats
router.get('/stats', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ is_active: true });

        const totalInvestments = await UserInvestment.countDocuments();
        const activeInvestments = await UserInvestment.countDocuments({ is_active: true });

        // Sum of all active investments amount?
        const activeInvestmentVolumeResult = await UserInvestment.aggregate([
            { $match: { is_active: true } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const activeInvestmentVolume = activeInvestmentVolumeResult[0]?.total || 0;

        const totalReferrals = await UserReferral.countDocuments();

        const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
        const pendingDeposits = await Deposit.countDocuments({ status: 'pending' });

        res.json({
            users: { total: totalUsers, active: activeUsers },
            investments: { total: totalInvestments, active: activeInvestments, volume: activeInvestmentVolume },
            referrals: { total: totalReferrals },
            pending: { withdrawals: pendingWithdrawals, deposits: pendingDeposits }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
