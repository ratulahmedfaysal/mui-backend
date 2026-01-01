const router = require('express').Router();
const Pair = require('../models/Pair');
const auth = require('../middleware/auth');

// Get all pairs
router.get('/', async (req, res) => {
    try {
        const pairs = await Pair.find().sort({ symbol: 1 });
        res.json(pairs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add pair (Admin)
router.post('/', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const { symbol } = req.body;
        const pair = new Pair({ symbol });
        await pair.save();
        res.json(pair);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update pair
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const { symbol } = req.body;
        const pair = await Pair.findByIdAndUpdate(req.params.id, { symbol }, { new: true });
        res.json(pair);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete pair
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        await Pair.findByIdAndDelete(req.params.id);
        res.json({ message: 'Pair deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
