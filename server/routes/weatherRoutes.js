const express = require('express');
const router = express.Router();
const { getWeatherByLocation } = require('../controllers/weatherController');

router.get('/', getWeatherByLocation);

module.exports = router;
