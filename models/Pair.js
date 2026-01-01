const mongoose = require('mongoose');

const pairSchema = new mongoose.Schema({
    symbol: { type: String, required: true, unique: true }, // e.g. BTCUSDT
    is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Pair', pairSchema);
