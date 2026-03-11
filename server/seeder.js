const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Scheme = require('./models/Scheme');
const Crop = require('./models/Crop');
const Officer = require('./models/Officer');
const Admin = require('./models/Admin');
const Farmer = require('./models/Farmer');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Import data from separate files
const schemes = require('./data/schemes');
const crops = require('./data/crops');
const officers = require('./data/officers');

dotenv.config();

const importData = async () => {
    try {
        await connectDB();

        console.log('Clearing existing data...');
        await Scheme.deleteMany();
        await Crop.deleteMany();
        await Officer.deleteMany();
        await Admin.deleteMany();
        await Farmer.deleteMany();

        console.log('Seeding Detailed Schemes...');
        await Scheme.insertMany(schemes);

        console.log('Seeding Crops...');
        await Crop.insertMany(crops);

        console.log('Seeding Officers...');
        await Officer.insertMany(officers);

        console.log('Seeding Admin...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        await Admin.create({
            username: 'admin',
            password: hashedPassword,
            name: 'Super Admin',
            role: 'ADMIN'
        });

        console.log('Seeding Farmer...');
        // Need to grab a crop to assign to the farmer
        const wheat = await Crop.findOne({ "name.en": "Wheat" }) || await Crop.findOne();

        await Farmer.create({
            phone: '9876543210',
            password: 'password123', // Will be hashed automatically by pre-save
            name: 'Test Farmer',
            language: 'mr',
            location: {
                district: 'Pune',
                village: 'Shivajinagar'
            },
            farm: {
                landSize: 5,
                landSizeUnit: 'acres',
                soilType: 'black'
            },
            cropsGrown: wheat ? [wheat._id] : []
        });

        console.log('✅ COMPLETE: Schemes, Crops, Officers, and Farmer data imported.');
        process.exit();
    } catch (err) {
        console.error('❌ Error with data import:', err);
        process.exit(1);
    }
};

importData();
