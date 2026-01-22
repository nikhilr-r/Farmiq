const mongoose = require('mongoose');

const officerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String, required: true }, // e.g., "Taluka Agriculture Officer"
    level: {
        type: String,
        enum: ['DISTRICT', 'TALUKA', 'VILLAGE'],
        required: true
    },
    location: {
        district: { type: String, required: true },
        taluka: { type: String },
        village: { type: String }
    },
    contact: {
        phone: { type: String },
        email: { type: String },
        officeAddress: { type: String },
        workingHours: { type: String }
    },
    isVerified: { type: Boolean, default: true }
}, { timestamps: true });

// Index for fast search by location
officerSchema.index({ 'location.district': 1, 'location.taluka': 1 });

module.exports = mongoose.model('Officer', officerSchema);
