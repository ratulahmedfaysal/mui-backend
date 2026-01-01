const router = require('express').Router();
const InvestmentPlan = require('../models/InvestmentPlan');
const auth = require('../middleware/auth');

// Get all plans (Public)
router.get('/', async (req, res) => {
    try {
        const plans = await InvestmentPlan.find({ is_active: true }).sort({ min_amount: 1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Get All (including inactive)
router.get('/admin', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        const plans = await InvestmentPlan.find().sort({ min_amount: 1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Plan
router.post('/', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        const plan = new InvestmentPlan(req.body);
        await plan.save();
        res.json(plan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update Plan
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        const plan = await InvestmentPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(plan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Plan
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        await InvestmentPlan.findByIdAndDelete(req.params.id);
        res.json({ message: 'Plan deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
