const mongoose = require('mongoose');

const rawUpdateSchema = new mongoose.Schema({
    source: { type: String, required: true },
    originalTitle: { type: String },
    originalContent: { type: String },
    fetchedAt: { type: Date, default: Date.now },
    url: { type: String, required: true, unique: true }, // Prevent duplicates
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    processedContent: { type: String } // Content after Admin simplification
}, { timestamps: true });

module.exports = mongoose.model('RawUpdate', rawUpdateSchema);
