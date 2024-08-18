const mongoose = require('mongoose');
const Signup = mongoose.model('Signup');

async function isAuthenticated(req, res, next) {
    if (req.session.user) {
        try {
            const user = await Signup.findById(req.session.user._id);
            if (!user) {
                req.session.destroy();
                return res.redirect('/log_in');
            }
            next();
        } catch (err) {
            req.session.destroy();
            return res.redirect('/log_in');
        }
    } else {
        res.redirect('/log_in');
    }
}

module.exports = isAuthenticated;