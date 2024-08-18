const mongoose = require('mongoose');

const bloodStockSchema = new mongoose.Schema({
    blood_type: String,
    units: { type: Number, default: 0 }
});

module.exports = mongoose.model('BloodStock', bloodStockSchema);