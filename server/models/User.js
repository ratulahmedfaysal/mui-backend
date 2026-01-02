const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // will be hashed
    username: { type: String, required: true, unique: true }, // Added username
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    full_name: { type: String },
    balance: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    is_banned: { type: Boolean, default: false },
    referral_code: { type: String, unique: true },
    referred_by: { type: String }, // Code of the referrer
    two_factor_enabled: { type: Boolean, default: false },
    two_factor_secret: { type: String },
    two_factor_backup_codes: { type: [String] },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
