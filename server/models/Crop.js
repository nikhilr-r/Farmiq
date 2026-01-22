const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
    name: {
        mr: { type: String, required: true },
        en: { type: String, required: true }
    },
    season: {
        type: String,
        enum: ['Kharif', 'Rabi', 'Zaid', 'All Season', 'Kharif/Rabi'],
        required: true
    },
    sowingPeriod: {
        start: { type: String }, // e.g., "June"
        end: { type: String }
    },
    harvestPeriod: {
        start: { type: String },
        end: { type: String }
    },
    tasks: [{
        stage: { type: String }, // e.g., "Sowing", "Vegetative", "Flowering"
        description: { type: String },
        advisory: { type: String }, // Practical advice, NO BRANDS
        daysAfterSowing: { // NEW: For Calendar Logic
            start: { type: Number },
            end: { type: Number }
        }
    }],
    diseases: [{
        name: { type: String },
        symptoms: { type: String },
        solution: { type: String } // Generic chemical/organic names only
    }],
    weatherConditions: { type: String } // e.g., "Requires heavy rainfall"
}, { timestamps: true });

module.exports = mongoose.model('Crop', cropSchema);
