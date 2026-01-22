const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
    title: {
        mr: { type: String, required: true },
        en: { type: String }
    },
    type: {
        type: String,
        enum: ['STATE', 'CENTRAL'],
        required: true
    },
    category: {
        type: String,
        enum: ['Seeds', 'Horticulture', 'Tools', 'Insurance', 'Loan', 'Subsidies', 'Infrastructure', 'Social Welfare', 'Regional', 'Other'],
        required: true
    },
    applicableDistricts: [{ type: String }], // ["All"] or specific districts
    details: {
        eligibility: { type: String, required: true },
        documents: [{ type: String }],
        benefits: { type: String, required: true },
        applicationProcess: { type: String },
        lastDate: { type: Date },
        offlineMode: { type: Boolean, default: false }
    },
    officialSourceUrl: { type: String, required: true },
    veracity: {
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        verifiedAt: { type: Date, default: Date.now }
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);
