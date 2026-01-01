const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payment_method_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' }, // Optional if deleted
    amount: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    final_amount: { type: Number, required: true },
    transaction_data: mongoose.Schema.Types.Mixed, // For proof or gateway data
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    admin_notes: String,
    gateway_transaction_id: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deposit', depositSchema);
