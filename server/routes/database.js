const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Import all models to dump
console.log('Loading database routes...');
const User = require('../models/User');
const SiteSettings = require('../models/SiteSettings');
const InvestmentPlan = require('../models/InvestmentPlan');
const Transaction = require('../models/Transaction');
const Pair = require('../models/Pair');
const PaymentMethod = require('../models/PaymentMethod');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const UserInvestment = require('../models/UserInvestment');
const UserReferral = require('../models/UserReferral');
const ReferralSettings = require('../models/ReferralSettings');
const CoinPaymentsSettings = require('../models/CoinPaymentsSettings');

const MODELS = {
    users: User,
    site_settings: SiteSettings,
    investment_plans: InvestmentPlan,
    transactions: Transaction,
    pairs: Pair,
    payment_methods: PaymentMethod,
    deposits: Deposit,
    withdrawals: Withdrawal,
    user_investments: UserInvestment,
    user_referrals: UserReferral,
    referral_settings: ReferralSettings,
    coinpayments_settings: CoinPaymentsSettings
};

// Debug Ping
router.get('/ping', (req, res) => res.send('pong'));

// Backup - Download JSON
router.get('/backup', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const backup = {};
        for (const [key, Model] of Object.entries(MODELS)) {
            backup[key] = await Model.find({});
        }

        res.json(backup);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Backup failed' });
    }
});

// Restore - Upload JSON
router.post('/restore', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const data = req.body;
        const { clean } = req.query; // Check for ?clean=true

        if (!data) return res.status(400).json({ error: 'No data provided' });

        for (const [key, Model] of Object.entries(MODELS)) {
            if (data[key] && Array.isArray(data[key])) {

                if (clean === 'true') {
                    await Model.deleteMany({});
                }

                for (const item of data[key]) {
                    if (item._id) {
                        await Model.findByIdAndUpdate(item._id, item, { upsert: true });
                    } else {
                        await Model.create(item);
                    }
                }
            }
        }

        res.json({ message: 'Restore completed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Restore failed: ' + err.message });
    }
});

module.exports = router;
