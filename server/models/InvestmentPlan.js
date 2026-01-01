const mongoose = require('mongoose');

const investmentPlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subtitle: { type: String },
    min_amount: { type: Number, required: true },
    max_amount: { type: Number, required: true },
    daily_roi_percentage: { type: Number, required: true },
    duration_days: { type: Number, required: true },
    description: String,
    features: [String],
    is_active: { type: Boolean, default: true },
    return_principal: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InvestmentPlan', investmentPlanSchema);
