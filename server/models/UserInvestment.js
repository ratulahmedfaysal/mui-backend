const mongoose = require('mongoose');

const userInvestmentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentPlan', required: true },
    amount: { type: Number, required: true },
    daily_roi: { type: Number, required: true }, // Amount per day
    total_roi_earned: { type: Number, default: 0 },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date, required: true },
    last_claim_date: { type: Date },
    next_claim_date: { type: Date }, // When they can claim next
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserInvestment', userInvestmentSchema);
