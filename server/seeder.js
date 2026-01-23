const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Scheme = require('./models/Scheme');
const Crop = require('./models/Crop');
const Officer = require('./models/Officer');
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

        console.log('Seeding Detailed Schemes...');
        await Scheme.insertMany(schemes);

        console.log('Seeding Crops...');
        await Crop.insertMany(crops);

        console.log('Seeding Officers...');
        await Officer.insertMany(officers);

        console.log('✅ COMPLETE: Schemes, Crops, and Officers data imported.');
        process.exit();
    } catch (err) {
        console.error('❌ Error with data import:', err);
        process.exit(1);
    }
};

importData();
