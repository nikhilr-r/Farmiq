const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');

// @route   GET /api/v1/schemes
// @desc    Get all active schemes with filtering
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, category, district } = req.query;
        let query = { isActive: true };

        if (type) query.type = type;
        if (category) query.category = category;
        if (district) {
            // Logic: applicableDistricts contains "All" OR the specific district
            query.applicableDistricts = { $in: ['All', district] };
        }

        const schemes = await Scheme.find(query).sort({ updatedAt: -1 });
        res.json(schemes);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/v1/schemes/:id
// @desc    Get scheme by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const scheme = await Scheme.findById(req.params.id);
        if (!scheme) return res.status(404).json({ msg: 'Scheme not found' });
        res.json(scheme);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Scheme not found' });
        res.status(500).send('Server Error');
    }
});

module.exports = router;
