const mongoose = require('mongoose');
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const donorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    test: {
        type: String,
        required: true,
        enum:['Positive','Negative']
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
    units: {
        type: Number,
        default:1
    },
    contact: {
        type: String,
        required: true,
        unique:true,
    },
    donation_date: {
        type: Date,
        required: true,
        default: Date.now
    },
    gender:{
        type:String,
        require:true,
        enum:['Male','Female','Other']
    },
    weight:{
        type:Number,
        required:true,  
    },
    city:{
        type:String,
        require:true
    }
    ,
    status: { type: String, 
        default: 'Pending' }
        ,
        donor_deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Donor', donorSchema);
