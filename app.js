const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utilities/ExpressError');
const campgroundSchema = require('./validation/campgroundSchema');
const Review = require('./models/review');
const reviewSchema = require('./validation/reviewSchema.js');

// connect to DB
mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
.then(() => {
    console.log("Connected to the Database!");
})
.catch(err => {
    console.log("OH NO ERROR!");
    console.log(err);
})

const app = express();

// set up templating(ejs)
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// set up middleware
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    
    const { error } = campgroundSchema.validate(req.body.campground);
    
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
}

const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body.review);

    if ( error ) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
    
}

/**
 * RESTful routes
**/
app.get('/', (req, res) => {
    res.render('home');
})

/***** CAMPGROUND ROUTES *****/
// index route
app.get('/campgrounds', async (req, res, next) => {
    try {
        const allCamps = await Campground.find({});
        res.render('campgrounds/index', {allCamps});
    } catch(err) {
        next(err);
    } 
})

// new campground form route
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// post route
app.post('/campgrounds', validateCampground, async (req, res, next) => {
    try {
        // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    } catch(err) {
        next(err);
    }
    
})

// show route
app.get('/campgrounds/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id);   
        res.render('campgrounds/show', {campground});
    } catch(err) {
        next(err);
    }
    
})

// get campground edit form route
app.get('/campgrounds/:id/edit', async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        res.render('campgrounds/edit', {campground});
    } catch(err) {
        next(err);
    }
    
})

// patch (update and edit) route
app.patch('/campgrounds/:id', validateCampground, async (req, res, next) => {
    try {
        const { id } = req.params;
        // console.log(req.body);
        const updates = req.body.campground;
        const campground = await Campground.findByIdAndUpdate(id, updates, {runValidators: true});
        res.redirect(`/campgrounds/${campground._id}`);
    } catch(err) {
        next(err);
    }
}) 

// delete route
app.delete('/campgrounds/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findByIdAndDelete(id);
        res.redirect('/campgrounds');
    } catch(err) {
        next(err);
    }
})
/*****************************/


/***** REVIEW ROUTES *****/
// create a new reivew for the giving campground
app.post('/campgrounds/:cid/reviews', validateReview, async (req, res, next) => {
    try {
        const { cid } = req.params;
        const campground = await Campground.findById(cid);
        const review = new Review(req.body.review);
        campground.reviews.push(review);
        await campground.save();
        await review.save();
        res.redirect(`/campgrounds/${campground._id}`);
        // if (!campground) {
        //     throw new ExpressError("Campground doesn't exist", 404);
        // }
    } catch (err) {
        next(err);
    }
    
})
/*************************/


// no matching url middleware
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// error handling middleware
app.use((err, req, res, next) => {
    const {status = 500} = err;
    if (!err.message) {
        err.message = "Something went wrong";
    }
    // console.log(err.stack);
    res.status(status).render('error', {err});
    // res.send('oh boy, something happened!');
})

app.listen(3000, () => {
    console.log('APP IS LISTENING ON PORT 3000!');
})

