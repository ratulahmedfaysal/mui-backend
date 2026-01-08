const mongoose = require('mongoose');

const spinRecordSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    win_amount: {
        type: Number,
        required: true
    },
    profit_loss: {
        type: Number, // Convenience field: win_amount - cost
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SpinRecord', spinRecordSchema);
