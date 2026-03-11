const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');
const farmerAuth = require('../middleware/farmerAuth');

// @route   POST /api/v1/farmer/auth/register
// @desc    Register a farmer
router.post('/register', async (req, res) => {
    const { phone, password, name, language, district, taluka, village, state, pincode, landSize, landSizeUnit, soilType, irrigationType, farmingType, cropsGrown } = req.body;

    try {
        let farmer = await Farmer.findOne({ phone });

        if (farmer) {
            return res.status(400).json({ msg: 'Farmer already exists with this phone number' });
        }

        farmer = new Farmer({
            phone,
            password,
            name,
            language,
            location: {
                district,
                taluka,
                village,
                state,
                pincode
            },
            farm: {
                landSize,
                landSizeUnit,
                soilType,
                irrigationType,
                farmingType
            },
            cropsGrown
        });

        // Password hashing is now handled by the schema's pre-save hook

        await farmer.save();

        const payload = {
            farmer: {
                id: farmer.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '30d' }, // Farmers might need longer sessions
            (err, token) => {
                if (err) throw err;
                res.json({ token, msg: 'Registration successful' });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/v1/farmer/auth/login
// @desc    Authenticate farmer & get token
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;

    try {
        // We explicitly select password because it defaults to select: false
        let farmer = await Farmer.findOne({ phone }).select('+password');

        if (!farmer) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Password relies on the custom checkPassword method since select: false was added
        const isMatch = await farmer.checkPassword(password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            farmer: {
                id: farmer.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/v1/farmer/auth/me
// @desc    Get logged in farmer profile
router.get('/me', farmerAuth, async (req, res) => {
    try {
        // Find farmer and exclude password, populate crops if needed
        const farmer = await Farmer.findById(req.farmer.id)
            .populate('cropsGrown', 'name season');
        // Explicit password exclusion isn't needed here with select: false in schema, but we can use toPublicProfile() if wanted

        res.json(farmer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/v1/farmer/auth/profile
// @desc    Update logged in farmer profile
router.put('/profile', farmerAuth, async (req, res) => {
    const { name, language, district, taluka, village, state, pincode, landSize, landSizeUnit, soilType, irrigationType, farmingType, cropsGrown, password } = req.body;

    try {
        let farmer = await Farmer.findById(req.farmer.id);
        if (!farmer) {
            return res.status(404).json({ msg: 'Farmer not found' });
        }

        // Update fields if provided
        if (name) farmer.name = name;
        if (language) farmer.language = language;

        // Update Location
        if (district || taluka || village || state || pincode) {
            farmer.location = {
                ...farmer.location,
                district: district || farmer.location.district,
                taluka: taluka || farmer.location.taluka,
                village: village || farmer.location.village,
                state: state || farmer.location.state,
                pincode: pincode || farmer.location.pincode
            };
        }

        // Update Farm Details
        if (landSize !== undefined || landSizeUnit || soilType || irrigationType || farmingType) {
            farmer.farm = {
                ...farmer.farm,
                landSize: landSize !== undefined ? landSize : farmer.farm.landSize,
                landSizeUnit: landSizeUnit || farmer.farm.landSizeUnit,
                soilType: soilType || farmer.farm.soilType,
                irrigationType: irrigationType || farmer.farm.irrigationType,
                farmingType: farmingType || farmer.farm.farmingType
            };
        }

        if (cropsGrown) farmer.cropsGrown = cropsGrown;
        if (password) farmer.password = password; // Pre-save hook hashes it

        await farmer.save();

        res.json({ msg: 'Profile updated successfully', farmer: farmer.toPublicProfile() });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
