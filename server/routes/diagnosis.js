const express = require('express');
const router = express.Router();
const { analyzeCrop, getHistory } = require('../controllers/diagnosisController');
const auth = require('../middleware/farmerAuth');

// @route   POST api/v1/diagnosis/analyze
// @desc    Analyze crop image and predict disease
// @access  Private (Farmer)
router.post('/analyze', auth, analyzeCrop);

// @route   GET api/v1/diagnosis/history
// @desc    Get user's diagnosis history
// @access  Private (Farmer)
router.get('/history', auth, getHistory);

module.exports = router;
