const router = require('express').Router();
const PaymentMethod = require('../models/PaymentMethod');
const auth = require('../middleware/auth');

// Get All (Admin sees all, public sees active?)
// Admin page needs all.
// Get All (Public/Auth - Returns active for users, all for admin)
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        if (req.role !== 'admin') {
            query.is_active = true;
        }

        const methods = await PaymentMethod.find(query).sort({ created_at: -1 });
        res.json(methods);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create
router.post('/', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const method = new PaymentMethod(req.body);
        await method.save();
        res.json(method);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const method = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(method);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        await PaymentMethod.findByIdAndDelete(req.params.id);
        res.json({ message: 'Payment method deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CoinPayments Settings Routes ---
const CoinPaymentsSettings = require('../models/CoinPaymentsSettings');

// Get Settings - Public/Auth for deposit page
router.get('/settings/coinpayments', auth, async (req, res) => {
    try {
        const settings = await CoinPaymentsSettings.findOne(); // Assuming single settings doc
        res.json(settings || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update/Create Settings
router.post('/settings/coinpayments', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        let settings = await CoinPaymentsSettings.findOne();
        if (settings) {
            settings = await CoinPaymentsSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
        } else {
            settings = new CoinPaymentsSettings(req.body);
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
