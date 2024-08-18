const mongoose = require('mongoose');
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const patient_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    disease: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    blood_type: {
        type: String,
        required: true,
        enum: bloodGroups
    },
    gender: {
        type: String,
        require: true,
        enum: ['Male', 'Female', 'Other']
    },
    units: {
        type: Number,
        required: true
    },
    contact: {
        type: String,
        required: true,
        unique:true
    },
    request_date: {
        type: Date,
        required: true,
        default: Date.now
    }, status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    patient_deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Patient', patient_schema);