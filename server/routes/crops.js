const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');

// @route   GET /api/v1/crops
// @desc    Get all crops with filtering
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { season } = req.query;
        let query = {};

        if (season) query.season = season;

        const crops = await Crop.find(query).sort({ 'name.en': 1 });
        res.json(crops);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/v1/crops/:id
// @desc    Get crop by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);
        if (!crop) return res.status(404).json({ msg: 'Crop not found' });
        res.json(crop);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Crop not found' });
        res.status(500).send('Server Error');
    }
});

module.exports = router;
