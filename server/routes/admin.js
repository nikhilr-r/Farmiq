const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Scheme = require('../models/Scheme');
const Crop = require('../models/Crop');
const RawUpdate = require('../models/RawUpdate');
const fetchUpdates = require('../utils/fetchUpdates');

// @route   POST /api/v1/admin/schemes
// @desc    Create a new scheme
router.post('/schemes', auth, async (req, res) => {
    try {
        // Basic implementation: Create scheme
        const newScheme = new Scheme({
            ...req.body,
            'veracity.verifiedBy': req.admin.id
        });
        const scheme = await newScheme.save();
        res.json(scheme);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/v1/admin/crops
// @desc    Create a new crop
router.post('/crops', auth, async (req, res) => {
    try {
        const newCrop = new Crop(req.body);
        const crop = await newCrop.save();
        res.json(crop);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/v1/admin/updates/pending
// @desc    Get pending updates
router.get('/updates/pending', auth, async (req, res) => {
    try {
        const updates = await RawUpdate.find({ status: 'PENDING' });
        res.json(updates);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/v1/admin/updates/:id/verify
// @desc    Verify (Approve) an update
router.put('/updates/:id/verify', auth, async (req, res) => {
    try {
        const update = await RawUpdate.findById(req.params.id);
        if (!update) return res.status(404).json({ msg: 'Update not found' });

        update.status = 'APPROVED';
        // Ideally user might edit content here too
        if (req.body.processedContent) {
            update.processedContent = req.body.processedContent;
        }

        await update.save();
        res.json(update);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/v1/admin/updates/fetch
// @desc    Manually trigger update fetcher
router.post('/updates/fetch', auth, async (req, res) => {
    try {
        const count = await fetchUpdates();
        res.json({ msg: `Fetched ${count} new updates` });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
