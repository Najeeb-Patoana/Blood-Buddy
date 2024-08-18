const express = require('express');
const admin_route = express.Router();
const moment = require('moment');
const Donor = require('../models/donor');
const Patient = require('../models/patient');
const BloodStock = require('../models/blood_stock');
const isAuthenticated = require('../middlewares/auth');
admin_route.use(isAuthenticated);

// Admin Home Page
admin_route.get('/', async (req, res) => {
    try {
        res.render('admin_home', { title: "Admin Home Page", activePage: 'admin_home', header: 'Welcome to Blood Buddy' });
    } catch (error) {
        res.json({ message: error.message });
    }
});

// Donors Page
admin_route.get('/donors', async (req, res) => {
    try {
        const don = await Donor.find({ donor_deleted: false });
        const donors = don.map(donor => {
            return {
                ...donor.toObject(),
                donation_date: moment(donor.donation_date).format('MMM DD YYYY')
            };
        });
        res.render('donors', { donors, title: "Donors Page", activePage: 'donors', header: 'Donors' });
    } catch (error) {
        res.json({ message: error.message });
    }
});

// Edit Donor Page
admin_route.get('/edit_donor/:id', async (req, res) => {
    try {
        const donor = await Donor.findById(req.params.id);
        res.render('edit_donors', { donors: donor, title: "Donors Edit Page", activePage: 'donors', header: 'Edit Donor Info' });
    } catch (error) {
        res.json({ message: error.message });
    }
});

// Update Donor
admin_route.put('/edit_donor/:id', async (req, res) => {
    const { name, age, gender, blood_type, weight, contact, disease } = req.body;
    try {
        await Donor.findByIdAndUpdate(req.params.id, { name, age, gender, blood_type, weight, contact, disease }, { new: true });
        req.session.message = {
            type: 'success',
            message: "Edited successfully"
        };
        res.redirect('/admin/donors');
    } catch (error) {
        res.json({ message: error.message });
    }
});

// Delete Donor
admin_route.delete('/delete_donor/:id', async (req, res) => {
    try {
        const donorId = req.params.id;
        const donor = await Donor.findById(donorId);
        if (donor.status === 'Pending') {
            await Donor.findByIdAndDelete(donorId);
        } else {
            await Donor.findByIdAndUpdate(donorId, { donor_deleted: true });
        }

        req.session.message = {
            type: 'success',
            message: "Donor deleted successfully."
        };
        res.redirect('/admin/donors');
    } catch (error) {
        res.json({ message: error.message });
    }
});
// Patients Page
admin_route.get('/patients', async (req, res) => {
    try {
        const pat = await Patient.find({ patient_deleted: false });
        const patients = pat.map(patient => {
            return {
                ...patient.toObject(),
                request_date: moment(patient.request_date).format('MMM DD YYYY')
            };
        });
        res.render('patients', { patients, title: "Patients Page", activePage: 'patients', header: 'Patients' });
    } catch (error) {
        res.json({ message: error.message });
    }
});

// Edit Patient Page
admin_route.get('/edit_patient/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        res.render('edit_patients', { patients: patient, title: "Patients Edit Page", activePage: 'patients', header: 'Edit Patient Info' });
    } catch (error) {
        res.json({ message: error.message });
    }
});

// Update Patient
admin_route.put('/edit_patient/:id', async (req, res) => {
    const { name, age, gender, blood_type, units, contact, disease } = req.body;
    try {
        await Patient.findByIdAndUpdate(req.params.id, { name, age, gender, blood_type, units, contact, disease }, { new: true });
        req.session.message = {
            type: 'success',
            message: "Edited successfully"
        };
        res.redirect('/admin/patients');
    } catch (error) {
        res.json({ message: error.message });
    }
});

// Delete Patient
admin_route.delete('/delete_patient/:id', async (req, res) => {
    try {
        const patientId = req.params.id;

        const patient = await Patient.findById(patientId);

        if (patient.status === 'Pending') {
            await Patient.findByIdAndDelete(patientId);
        } else {
         await Patient.findByIdAndUpdate(patientId, { patient_deleted: true });
        }
        req.session.message = {
            type: 'success',
            message: "Patient deleted successfully"
        };
        res.redirect('/admin/patients');
    } catch (error) {
        res.json({ message: error.message });
    }
});

// Blood Donations Page
admin_route.get('/blood_donations', async (req, res) => {
    try {
        const don = await Donor.find();
        const donors = don.map(donor => {
            return {
                ...donor.toObject(),
                donation_date: moment(donor.donation_date).format('MMM DD YYYY')
            };
        });
        res.render('blood_donations', { donors, title: "Donations Detail", activePage: 'blood_donations', header: 'Donations Detail' });
    } catch (error) {
        res.json({ message: error.message });
    }
});

// Approve Donation
admin_route.put('/approve_donation', async (req, res) => {
    const { donorId, status } = req.body;
    try {
        await Donor.findByIdAndUpdate(donorId, { status });

        const donor = await Donor.findById(donorId);

        await BloodStock.updateOne(
            { blood_type: donor.blood_type },
            { $inc: { units: donor.units } },
            { upsert: true }
        );

        req.session.message = {
            type: 'success',
            message: "Donation Approved"
        };
        res.redirect('/admin/blood_donations');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reject Donation
admin_route.put('/reject_donation', async (req, res) => {
    const { donorId, status } = req.body;
    try {
        await Donor.findByIdAndUpdate(donorId, { status });
        req.session.message = {
            type: 'danger',
            message: "Donation Rejected"
        };
        res.redirect('/admin/blood_donations');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Blood Requests Page
admin_route.get('/blood_requests', async (req, res) => {
    try {
        const pat = await Patient.find();
        const patients = pat.map(patient => {
            return {
                ...patient.toObject(),
                request_date: moment(patient.request_date).format('MMM DD YYYY')
            };
        });
        res.render('blood_requests', {
            patients,
            title: "Blood Requests",
            activePage: 'blood_requests',
            header: 'Blood Requests'
        });
    } catch (error) {
        res.json({ message: error.message });
    }
});
// Approve Request
admin_route.put('/approve_request', async (req, res) => {
    const { patientId } = req.body;
    try {
        const patient = await Patient.findById(patientId);
        const bloodStock = await BloodStock.findOne({ blood_type: patient.blood_type });

        if (bloodStock && bloodStock.units >= patient.units) {
            await Patient.findByIdAndUpdate(patientId, { status: 'Approved' });
            await BloodStock.updateOne(
                { blood_type: patient.blood_type },
                { $inc: { units: -patient.units } }
            );

            req.session.message = {
                type: 'success',
                message: "Request Approved"
            };
        } else {
            req.session.message = {
                type: 'danger',
                message: "Blood out of stock"
            };
        }
        res.redirect('/admin/blood_requests');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reject Request
admin_route.put('/reject_request', async (req, res) => {
    const { patientId } = req.body;
    try {
        await Patient.findByIdAndUpdate(patientId, { status: 'Rejected' });

        req.session.message = {
            type: 'danger',
            message: "Request Rejected"
        };
        res.redirect('/admin/blood_requests');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Blood Stock Page
admin_route.get('/blood_stock', async (req, res) => {
    try {
        const bloodStocks = await BloodStock.find();
        const totalDonors = await Donor.countDocuments({ status: { $in: ['Completed', 'Approved'] } });
        const totalRequests = await Patient.countDocuments({ status: { $ne: 'Pending' } });
        const approvedRequests = await Patient.countDocuments({ status: 'Approved' });

        const totalBloodUnits = await BloodStock.aggregate([
            { $group: { _id: null, totalUnits: { $sum: '$units' } } }
        ]);
        res.render('blood_stock', {
            bloodStocks,
            totalDonors,
            totalRequests,
            approvedRequests,
            totalBloodUnits: totalBloodUnits[0] ? totalBloodUnits[0].totalUnits : 0,
            title: "Blood Stock",
            activePage: 'blood_stock',
            header: 'Blood Stock'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});// Request History Page
admin_route.get('/request_history', async (req, res) => {
    try {
        const rpatients = await Patient.find({ status: 'Rejected' });
        const rejectedRequests = rpatients.map(patient => ({
            ...patient.toObject(),
            request_date: moment(patient.request_date).format('MMM DD YYYY')
        }));

        const apatients = await Patient.find({ status: 'Approved' });
        const approvedRequests = apatients.map(patient => ({
            ...patient.toObject(),
            request_date: moment(patient.request_date).format('MMM DD YYYY')
        }));

        res.render('request_history', {
            title: "Request History",
            activePage: 'request_history',
            header: 'Request History',
            rejectedRequests,
            approvedRequests
        });
    } catch (error) {
        res.json({ message: error.message });
    }
});
module.exports = admin_route;