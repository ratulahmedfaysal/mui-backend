const router = require('express').Router();
const UserInvestment = require('../models/UserInvestment');
const InvestmentPlan = require('../models/InvestmentPlan');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ReferralSettings = require('../models/ReferralSettings');
const auth = require('../middleware/auth');

// Get my investments
router.get('/', auth, async (req, res) => {
    try {
        const investments = await UserInvestment.find({ user_id: req.user })
            .populate('plan_id', 'name duration_days daily_roi_percentage subtitle return_principal')
            .sort({ start_date: -1 });
        res.json(investments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get All Investments
router.get('/all', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const investments = await UserInvestment.find()
            .populate('user_id', 'email username full_name')
            .populate('plan_id', 'name duration_days daily_roi_percentage subtitle return_principal')
            .sort({ start_date: -1 });
        res.json(investments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Investment
router.post('/', auth, async (req, res) => {
    try {
        const { plan_id, amount } = req.body;
        const userId = req.user;

        // 1. Validation
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const plan = await InvestmentPlan.findById(plan_id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        if (!plan.is_active) return res.status(400).json({ error: 'Plan is not active' });
        if (amount < plan.min_amount || amount > plan.max_amount) {
            return res.status(400).json({ error: `Amount must be between ${plan.min_amount} and ${plan.max_amount}` });
        }
        if (user.balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // 2. Deduct Balance & Update User Stats
        user.balance -= amount;
        user.total_invested += amount;
        user.has_active_plan = true;
        await user.save();

        // 3. Create Investment Record
        const dailyRoi = (amount * plan.daily_roi_percentage) / 100;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration_days);

        const investment = new UserInvestment({
            user_id: userId,
            plan_id,
            amount,
            daily_roi: dailyRoi,
            total_roi_earned: 0,
            start_date: new Date(),
            end_date: endDate,
            next_claim_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            is_active: true
        });
        await investment.save();

        // 4. Create Transaction Record
        const transaction = new Transaction({
            user_id: userId,
            type: 'investment',
            amount,
            balance_before: user.balance + amount,
            balance_after: user.balance,
            description: `Investment in ${plan.name}`,
            status: 'approved'
        });
        await transaction.save();

        // 5. Distribute Referral Commissions
        await distributeCommissions(userId, amount, 'investment');

        res.status(201).json(investment);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Claim ROI
router.post('/:id/claim', auth, async (req, res) => {
    try {
        const investment = await UserInvestment.findById(req.params.id).populate('plan_id');
        if (!investment) return res.status(404).json({ error: 'Investment not found' });

        if (investment.user_id.toString() !== req.user) return res.status(403).json({ error: 'Access denied' });

        const now = new Date();
        const user = await User.findById(req.user);

        // Check for expiry/completion
        if (new Date(investment.end_date) < now) {
            // Investment Expired/Completed
            if (!investment.is_active) return res.status(400).json({ error: 'Investment already completed' });

            const shouldReturnPrincipal = investment.plan_id.return_principal;
            investment.is_active = false;
            await investment.save();

            if (shouldReturnPrincipal) {
                user.balance += investment.amount;
                await user.save();

                await new Transaction({
                    user_id: user._id,
                    type: 'deposit', // or 'capital_return'
                    amount: investment.amount,
                    balance_before: user.balance - investment.amount,
                    balance_after: user.balance,
                    description: `Capital Return - ${investment.plan_id.name}`,
                    status: 'approved'
                }).save();

                return res.json({ message: `Investment completed! Capital returned: $${investment.amount}` });
            }

            return res.json({ message: 'Investment completed successfully!' });
        }


        // Normal ROI Claim
        if (new Date(investment.next_claim_date) > now) {
            return res.status(400).json({ error: 'Not time to claim yet' });
        }

        // Update Investment
        const nextClaimDate = new Date(now);
        nextClaimDate.setDate(nextClaimDate.getDate() + 1);

        investment.last_claim_date = now;
        investment.next_claim_date = nextClaimDate;
        investment.total_roi_earned += investment.daily_roi;
        await investment.save();

        // Credit User
        user.balance += investment.daily_roi;
        // user.total_roi_earned += investment.daily_roi; // If schema has this field
        await user.save();

        // Log Transaction
        await new Transaction({
            user_id: user._id,
            type: 'roi_claim',
            amount: investment.daily_roi,
            balance_before: user.balance - investment.daily_roi,
            balance_after: user.balance,
            description: `ROI claim from ${investment.plan_id.name}`,
            status: 'approved'
        }).save();

        // Distribute Matching Bonus (Interest Commission)
        await distributeCommissions(user._id, investment.daily_roi, 'interest');

        res.json({ message: `Successfully claimed $${investment.daily_roi.toFixed(2)} ROI!` });

    } catch (err) {
        console.error('Claim Error:', err);
        res.status(500).json({ error: err.message });
    }
});


// Commission Distribution Logic
async function distributeCommissions(sourceUserId, amount, type) {
    try {
        const settings = await ReferralSettings.find({ system_type: type, is_active: true }).sort({ level_number: 1 });
        if (!settings.length) return;

        let walkerUser = await User.findById(sourceUserId);
        const maxLevel = settings[settings.length - 1].level_number;
        const settingsMap = new Map(settings.map(s => [s.level_number, s]));

        // Get source user info for description
        const sourceUser = await User.findById(sourceUserId);

        for (let level = 1; level <= maxLevel; level++) {
            if (!walkerUser || !walkerUser.referred_by) break;

            // Find referrer by referral_code
            const uplineUser = await User.findOne({ referral_code: walkerUser.referred_by });
            if (!uplineUser) break;

            const setting = settingsMap.get(level);
            if (setting) {
                const commission = (amount * setting.commission_percentage) / 100;

                if (commission > 0) {
                    // Credit Uplines
                    uplineUser.balance += commission;
                    // uplineUser.total_referral_earned += commission; // if schema exists
                    await uplineUser.save();

                    // Log Transaction
                    await new Transaction({
                        user_id: uplineUser._id,
                        type: 'referral_commission',
                        amount: commission,
                        balance_before: uplineUser.balance - commission,
                        balance_after: uplineUser.balance,
                        description: `Referral bonus (Level ${level}) from ${sourceUser ? sourceUser.username : 'downline'}`,
                        status: 'approved'
                    }).save();

                    // Update UserReferral record if exists (for statistics)
                    if (level === 1) {
                        const UserReferral = require('../models/UserReferral');
                        await UserReferral.findOneAndUpdate(
                            { referrer_id: uplineUser._id, referred_user_id: sourceUserId },
                            { $inc: { commission_earned: commission } }
                        );
                    }
                }
            }

            // Move up
            walkerUser = uplineUser;
        }

    } catch (err) {
        console.error('Commission distribution error:', err);
    }
}

module.exports = router;
