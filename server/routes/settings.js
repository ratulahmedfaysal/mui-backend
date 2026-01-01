const router = require('express').Router();
const SiteSettings = require('../models/SiteSettings');
const auth = require('../middleware/auth');

// Get Settings (Public)
router.get('/', async (req, res) => {
    try {
        let settings = await SiteSettings.findOne({ key: 'main_settings' });
        if (!settings) {
            // Create default if not exists
            settings = new SiteSettings({ key: 'main_settings' });
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Settings (Admin Only)
// ideally checks for req.role === 'admin'
router.put('/:section', auth, async (req, res) => {
    try {
        // Check for admin role
        if (req.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { section } = req.params;
        const data = req.body;

        // Define allowed sections to prevent arbitrary writes if needed, 
        // but schema is mixed so it's flexible. 
        // We update the specific path: e.g. "general" -> data

        const update = {};
        update[section] = data;

        const settings = await SiteSettings.findOneAndUpdate(
            { key: 'main_settings' },
            { $set: update },
            { new: true, upsert: true }
        );

        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
