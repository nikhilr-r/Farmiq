const mongoose = require('mongoose');

const DiagnosisHistorySchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  cropName: {
    type: String
  },
  imageBase64: {
    type: String, // Store small thumbnails or full base64 if needed, keeping it simple
    required: true
  },
  diagnosis: {
    diseaseName: String,
    severity: String,
    confidence: Number,
    description: String
  },
  advisory: {
    immediate: String,
    preventive: String,
    organic: String,
    chemical: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DiagnosisHistory', DiagnosisHistorySchema);
