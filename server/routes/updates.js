const express = require('express');
const router = express.Router();
const RawUpdate = require('../models/RawUpdate');

// @route   GET /api/v1/updates
// @desc    Get all APPROVED updates
// @access  Public
router.get('/', async (req, res) => {
    try {
        const updates = await RawUpdate.find({ status: 'APPROVED' })
            .sort({ fetchedAt: -1 })
            .select('-originalContent'); // Hide raw content if not needed
        res.json(updates);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
