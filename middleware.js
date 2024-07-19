const requireLogin = (req, res, next) => {
    // console.log("isAuthenticate ? " + req.isAuthenticated());
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must sign in first!');
        res.redirect('/login');
    } else {
        next();
    }
}

const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        // Since Passport.js will clear the session after sucessful authentication
        // Save the returnTo somewhere else other than session
        req.returnTo = req.session.returnTo;
    }
    next();
}

exports.requireLogin = requireLogin;
exports.storeReturnTo = storeReturnTo;