const ExpressError = require('./utilities/ExpressError')
const campgroundSchema = require('./validation/campgroundSchema')
const Campground = require('./models/campground')
const reviewSchema = require('./models/review')

exports.requireLogin = (req, res, next) => {
    // console.log("isAuthenticate ? " + req.isAuthenticated());
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must sign in first!');
        res.redirect('/login');
    } else {
        next();
    }
}

exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        // Since Passport.js will clear the session after sucessful authentication
        // Save the returnTo somewhere else other than session
        req.returnTo = req.session.returnTo;
    }
    next();
}

// campgrounds middleware
exports.validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
}

exports.checkAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // check if the author of the campground is the current user
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', "You do not have permission!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// reviews middleware
exports.validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);

    if ( error ) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
    
}