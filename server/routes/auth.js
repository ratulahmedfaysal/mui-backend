const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, username, referral_code } = req.body;

        // Validation
        if (!email || !password || !username)
            return res.status(400).json({ error: 'Please enter all required fields' });

        if (password.length < 6)
            return res.status(400).json({ error: 'Password must be at least 6 characters' });

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser)
            return res.status(400).json({ error: 'An account with this email or username already exists' });

        // Hash password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate unique referral code for the new user
        const { cryptoRandomStringAsync } = await import('crypto-random-string');
        const newReferralCode = await cryptoRandomStringAsync({ length: 8, type: 'alphanumeric' });

        // Handle Referral Logic
        let referredBy = null;
        if (referral_code) {
            const referrer = await User.findOne({ referral_code });
            if (referrer) {
                referredBy = referrer.referral_code;
            }
        }

        // Create new user
        const newUser = new User({
            email,
            password: passwordHash,
            full_name,
            username,
            referral_code: newReferralCode,
            referred_by: referredBy,
            role: 'user' // Default to user
        });

        const savedUser = await newUser.save();

        if (referredBy) {
            const referrer = await User.findOne({ referral_code: referredBy });
            if (referrer) {
                const UserReferral = require('../models/UserReferral');
                await new UserReferral({
                    referrer_id: referrer._id,
                    referred_user_id: savedUser._id,
                    level: 1,
                    status: 'active'
                }).save();
            }
        }

        // Sign Token
        const token = jwt.sign(
            { id: savedUser._id, role: savedUser.role },
            process.env.JWT_SECRET
        );

        res.json({
            token,
            user: {
                id: savedUser._id,
                email: savedUser.email,
                username: savedUser.username,
                full_name: savedUser.full_name,
                role: savedUser.role,
                balance: savedUser.balance,
                referral_code: savedUser.referral_code
            }
        });

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, twoFactorCode } = req.body;

        // Validate
        if (!email || !password)
            return res.status(400).json({ error: 'Please enter all required fields' });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ error: 'Invalid credentials' });

        // Check 2FA
        if (user.two_factor_enabled) {
            if (!twoFactorCode) {
                return res.status(200).json({ require2fa: true }); // Frontend should detect this and show 2FA input
            }
            const verified = speakeasy.totp.verify({
                secret: user.two_factor_secret,
                encoding: 'base32',
                token: twoFactorCode
            });
            if (!verified) {
                // Check backup codes
                if (user.two_factor_backup_codes && user.two_factor_backup_codes.includes(twoFactorCode)) {
                    // remove used code
                    user.two_factor_backup_codes = user.two_factor_backup_codes.filter(c => c !== twoFactorCode);
                    await user.save();
                } else {
                    return res.status(400).json({ error: 'Invalid 2FA code' });
                }
            }
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                full_name: user.full_name,
                role: user.role,
                balance: user.balance,
                referral_code: user.referral_code,
                two_factor_enabled: user.two_factor_enabled
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User (Me)
router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user);
    res.json({
        id: user._id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        balance: user.balance,
        referral_code: user.referral_code,
        two_factor_enabled: user.two_factor_enabled
    });
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { full_name } = req.body;
        await User.findByIdAndUpdate(req.user, { full_name });
        res.json({ message: 'Profile updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Password
router.put('/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid current password' });

        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2FA Setup (Generate Secret)
router.get('/2fa/setup', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const secret = speakeasy.generateSecret({ name: `AuraBit (${user.email})` });

        QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) return res.status(500).json({ error: 'Error generating QR code' });

            // Temporary storage not needed, we send secret to client, client sends back to verify
            res.json({
                secret: secret.base32,
                qrCodeUrl: data_url
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2FA Enable
router.post('/2fa/enable', auth, async (req, res) => {
    try {
        const { secret, token } = req.body;
        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token
        });

        if (!verified) return res.status(400).json({ error: 'Invalid verification code' });

        const user = await User.findById(req.user);
        user.two_factor_enabled = true;
        user.two_factor_secret = secret;

        // Generate backup codes
        const { cryptoRandomStringAsync } = await import('crypto-random-string');
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            backupCodes.push(await cryptoRandomStringAsync({ length: 6, type: 'numeric' }));
        }
        user.two_factor_backup_codes = backupCodes;

        await user.save();
        res.json({ backupCodes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2FA Disable
router.post('/2fa/disable', auth, async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user);

        const verified = speakeasy.totp.verify({
            secret: user.two_factor_secret,
            encoding: 'base32',
            token: token
        });

        if (!verified) return res.status(400).json({ error: 'Invalid verification code' });

        user.two_factor_enabled = false;
        user.two_factor_secret = undefined;
        user.two_factor_backup_codes = undefined;
        await user.save();

        res.json({ message: '2FA Disabled' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Regenerate Backup Codes
router.post('/2fa/regenerate-codes', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const { cryptoRandomStringAsync } = await import('crypto-random-string');
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            backupCodes.push(await cryptoRandomStringAsync({ length: 6, type: 'numeric' }));
        }
        user.two_factor_backup_codes = backupCodes;
        await user.save();
        res.json({ backupCodes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify 2FA (General Purpose)
router.post('/2fa/verify', auth, async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user);

        if (!user.two_factor_enabled) return res.json({ success: true }); // No 2FA needed

        const verified = speakeasy.totp.verify({
            secret: user.two_factor_secret,
            encoding: 'base32',
            token: code
        });

        if (verified) {
            return res.json({ success: true });
        }

        // Check backup codes
        if (user.two_factor_backup_codes && user.two_factor_backup_codes.includes(code)) {
            // Remove used code
            user.two_factor_backup_codes = user.two_factor_backup_codes.filter(c => c !== code);
            await user.save();
            return res.json({ success: true, message: 'Backup code used' });
        }

        res.status(400).json({ error: 'Invalid verification code' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;
