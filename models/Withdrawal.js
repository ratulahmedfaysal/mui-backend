const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payment_method_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' },
    amount: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    final_amount: { type: Number, required: true },
    transaction_data: mongoose.Schema.Types.Mixed,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    admin_notes: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
