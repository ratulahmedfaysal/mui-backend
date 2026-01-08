const mongoose = require('mongoose');

// Unified transaction schema or separate? Supabase had 'transactions', 'deposits', 'withdrawals'.
// Let's create a unified 'Transaction' model for the history, and maybe specifics if needed.
// Actually, to match the "no damage" request, sticking to 1:1 mapping where possible is safer, 
// but a unified transaction log is better design. I'll make a unified one with a 'type' field.

const transactionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'withdrawal', 'investment', 'roi', 'referral_bonus', 'referral_commission', 'roi_claim', 'interest', 'lucky_spin_cost', 'lucky_spin_win'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USDT' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'approved', 'rejected'], default: 'pending' },
    tx_hash: String, // For crypto deposits
    balance_before: { type: Number, default: 0 },
    balance_after: { type: Number, default: 0 },
    reference_id: { type: mongoose.Schema.Types.ObjectId }, // Link to Deposit/Withdrawal/Investment
    description: String,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
