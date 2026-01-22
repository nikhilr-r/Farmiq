const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Will be hashed
    role: { type: String, default: 'ADMIN' },
    name: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
