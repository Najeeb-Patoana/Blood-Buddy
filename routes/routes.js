const express=require('express');
const router=express.Router();
const Donor=require('../models/donor')
const Patient=require('../models/patient')
const Signup=require('../models/signup')
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

router.get('/', async (req, res) => {
    try {
        res.render('index', {title: "Home Page",});
    } catch (error) {
        res.json({ message: error.message });
    }
});

router.get('/add_donor',(req,res)=>{

    res.render('add_donor',{title:'Add Donor'})
})

router.get('/chart',(req,res)=>{

    res.render('chart',{title:'Chart'})
})

router.get('/log_in',(req,res)=>{

    res.render('login',{title:'Admin Log in'})

})

router.post('/log_in', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Signup.findOne({ email });
        if (!user) {
            req.session.message = {
                type: 'danger',
                message: "Invalid email or password"
            };
            res.redirect('/log_in');
        } else {
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                req.session.message = {
                    type: 'danger',
                    message: "Invalid email or password"
                };
                res.redirect('/log_in');
            } else {
                req.session.user = user; // You can store more user information in the session if needed
                req.session.message = {
                    type: 'success',
                    message: "Login successfully"
                };
                res.redirect('/admin');
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message, type: 'danger' });
    }
});


router.get('/sign_up',(req,res)=>{

    res.render('signup',{title:'Admin Sign up'})
})

router.post('/sign_up',async(req,res)=>{

    const {name,email,password}=req.body;
    const new_admin=new Signup({name,email,password});
        
    try {
        await new_admin.save();
        res.status(200);
        req.session.message = {
            type: 'success',
            message: "Signup successfully"
        };
        res.redirect('/log_in');
    } catch (error) {
        res.status(500);
     
        req.session.message = {
            type: 'success',
            message: "Account Already Exists"
        };
        res.redirect('/log_in');
        // res.json({ message: error.message, type: 'danger' });
    }
})

//forget system 

router.get('/forgot_password', (req, res) => {
    res.render('forgot_password', { title: 'Forgot Password' });
});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await Signup.findOne({ email });
        if (!user) {
            req.session.message = {
                type: 'danger',
                message: "No account with that email address exists."
            };
            return res.redirect('/forgot_password');
        }

        // Generate a token
        const token = crypto.randomBytes(20).toString('hex');

        // Set the reset token and expiration time
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 600000; // 10 mint

        await user.save();

        // Send email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.MAIL,
              pass: process.env.MAIL_PASSWORD,
            },
          });

          const mailOptions = {
            to: user.email,
            from: process.env.FROM,
            subject: 'Password Reset Request',
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333333;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            color: #fff;
            background-color: #123;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            width: 50px;
            height: 50px;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .button {
            background-color: #d9534f;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #777777;
            background-color: #f4f4f4;
            border-top: 1px solid #e4e4e4;
            border-radius: 0 0 10px 10px;
        }
        .footer a {
            color: #333333;
            text-decoration: none;
            margin: 0 10px;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
           <h1 style="color: #d9534f;">Blood Buddy</h1>
            <h2>Password Reset Request</h2>
        </div>
        <div class="content">
            <p>Dear ${user.name},</p>
            <p>We received a request to reset your password for Blood Buddy.</p>
            <p>Click the button below to reset your password:</p>
            <a href="http://${req.headers.host}/reset_password/${token}" style="color: white;"  class="button">Reset Password</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
            <p>Contact: Najeeb Ullah Khan, Riphah International University</p>
            <p>+92 343 069 4964 | najeebpatoana007@gmail.com</p>
            <p>
                 <a href="https://github.com/Najeeb-Patoana" target="_blank">GitHub</a> |  <a href="https://www.linkedin.com/in/najeeb-ullah-khan-7bab7625a/" target="_blank">LinkedIn</a>
            </p>
            <p>Blood Buddy © All Rights Reserved</p>
        </div>
    </div>
</body>
</html>
            `
        };        
        await transporter.sendMail(mailOptions);
        

        req.session.message = {
            type: 'success',
            message: 'An email has been sent to ' + user.email + ' with further instructions.'
        };
        res.redirect('/log_in');
    } catch (error) {
        res.status(500).json({ message: error.message, type: 'danger' });
    }
});
router.get('/reset_password/:token', async (req, res) => {
    try {
        const user = await Signup.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            req.session.message = {
                type: 'danger',
                message: 'Password reset token is invalid or has expired.'
            };
            return res.redirect('/forgot_password');
        }

        res.render('reset_password', { title: 'Reset Password', token: req.params.token });
    } catch (error) {
        res.status(500).json({ message: error.message, type: 'danger' });
    }
});

router.post('/reset_password/:token', async (req, res) => {
    try {
        const user = await Signup.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.session.message = {
                type: 'danger',
                message: 'Password reset token is invalid or has expired.'
            };
            return res.redirect('/forgot_password');
        }

        if (req.body.password !== req.body.confirm_password) {
            req.session.message = {
                type: 'danger',
                message: 'Passwords do not match.'
            };
            return res.redirect(`/reset_password/${req.params.token}`);
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        req.session.message = {
            type: 'success',
            message: 'Your password has been updated successfully.'
        };
        res.redirect('/log_in');
    } catch (error) {
        res.status(500).json({ message: error.message, type: 'danger' });
    }
});




router.post('/add_donor', async (req, res) => {
    const { name, age, blood_type, units, gender, weight, contact, test ,city} = req.body;
    
    const already = await Donor.findOne({ contact });
    if (already) {
        res.status(400);
        req.session.message = {
            type: 'danger',
            message: "Contact number already exists"
        };
       return res.redirect('/add_donor');
    }

    const new_donor = new Donor({ name, age, blood_type, units, gender, weight, contact, test,city });
    
    try {
        await new_donor.save();
        res.status(200);
        req.session.message = {
            type: 'success',
            message: "Donor added successfully"
        };
        res.redirect('/');
    } catch (error) {
        res.status(500).json({ message: error.message, type: 'danger' });
    }
});


router.get('/add_patient',(req,res)=>{
    res.render('add_patient',{title:'Add Patient'})
})


router.post('/add_patient', async(req,res)=>{
    const {name,age,blood_type,units,gender,contact,disease}=req.body;

    const already = await Patient.findOne({ contact });
    if (already) {
        res.status(400);
        req.session.message = {
            type: 'danger',
            message: "Contact number already exists"
        };
       return res.redirect('/add_patient');
    }

    const new_patient=new Patient({name,age,blood_type,units,gender,contact,disease});
           
    try {
        await new_patient.save();
        res.status(200);
        req.session.message = {
            type: 'success',
            message: "Patient added successfully"
        };
        res.redirect('/');
    } catch (error) {
        res.status(500);
        res.json({ message: error.message, type: 'danger' });
    }
})

module.exports=router;