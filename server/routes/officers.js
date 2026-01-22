const express = require('express');
const router = express.Router();
const Officer = require('../models/Officer');

// @route   GET /api/v1/officers
// @desc    Get officers with filtering (District/Taluka)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { district, taluka, level } = req.query;
        let query = { isVerified: true };

        if (district) query['location.district'] = district;
        if (taluka) query['location.taluka'] = taluka;
        if (level) query.level = level;

        const officers = await Officer.find(query).sort({ 'location.district': 1, 'level': 1, 'name': 1 });
        res.json(officers);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
