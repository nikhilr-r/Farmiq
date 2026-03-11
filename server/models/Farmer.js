const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const farmerSchema = new mongoose.Schema({

    // ── Authentication
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false   // never returned in queries unless explicitly asked
    },

    // ── Personal Info
    name: {
        type: String,
        required: true,
        trim: true
    },
    language: {
        type: String,
        enum: ['en', 'mr', 'hi'],
        default: 'mr'
    },
    profilePhoto: {
        type: String,   // Cloudinary URL
        default: null
    },

    // ── Location (critical for weather + scheme matching)
    location: {
        district: { type: String, required: true, trim: true },
        taluka: { type: String, trim: true },
        village: { type: String, trim: true },
        state: { type: String, default: 'Maharashtra' },
        pincode: { type: String, trim: true },
        // For accurate weather API calls (GeoJSON Point format needed for 2dsphere index)
        coordinates: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
        }
    },

    // ── Farm Details
    farm: {
        landSize: { type: Number },                    // in acres
        landSizeUnit: { type: String, enum: ['acres', 'hectares'], default: 'acres' },
        soilType: { type: String, enum: ['black', 'red', 'alluvial', 'laterite', 'sandy', 'other'], default: 'black' },
        irrigationType: {
            type: String,
            enum: ['rainfed', 'drip', 'sprinkler', 'flood', 'canal'],
            default: 'rainfed'
        },
        farmingType: {
            type: String,
            enum: ['conventional', 'organic', 'mixed'],
            default: 'conventional'
        }
    },

    // ── Crops (what they grow — for scheme & disease matching)
    cropsGrown: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop'
    }],

    // ── Notification Preferences
    notifications: {
        diseaseAlerts: { type: Boolean, default: true },
        weatherWarnings: { type: Boolean, default: true },
        schemeUpdates: { type: Boolean, default: true },
        smsEnabled: { type: Boolean, default: true },   // SMS for low-data farmers
        pushEnabled: { type: Boolean, default: true }
    },

    // ── App State
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },  // phone OTP verification
    lastLogin: { type: Date, default: null },
    appVersion: { type: String, default: null },   // track which version they're on
    deviceTokens: [{ type: String }],                 // FCM push notification tokens

}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// ── Pre-save: hash password
farmerSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// ── Method: check password
farmerSchema.methods.checkPassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// ── Method: safe profile (no password, no tokens)
farmerSchema.methods.toPublicProfile = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.deviceTokens;
    return obj;
};

// ── Indexes for fast queries
farmerSchema.index({ 'location.district': 1 });        // weather risk batch jobs
farmerSchema.index({ cropsGrown: 1 });                 // scheme matching
farmerSchema.index({ 'location.coordinates': '2dsphere' }); // geo queries

module.exports = mongoose.model('Farmer', farmerSchema);
