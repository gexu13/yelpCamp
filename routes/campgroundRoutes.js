const campgroundSchema = require('../validation/campgroundSchema');
const ExpressError = require('../utilities/ExpressError');
const Campground = require('../models/campground');
const express = require('express');
const router = express.Router();


// campgrounds middleware
const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
}
/***** CAMPGROUND ROUTES *****/
// index route
router.get('/', async (req, res, next) => {
    try {
        const allCamps = await Campground.find({});
        res.render('campgrounds/index', {allCamps});
    } catch(err) {
        next(err);
    } 
})

// new campground form route
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

// post route
router.post('/', validateCampground, async (req, res, next) => {
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
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id).populate('reviews');   
        res.render('campgrounds/show', {campground});
    } catch(err) {
        next(err);
    }
    
})

// get campground edit form route
router.get('/:id/edit', async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        res.render('campgrounds/edit', {campground});
    } catch(err) {
        next(err);
    }
    
})

// patch (update and edit) route
router.patch('/:id', validateCampground, async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const updates = req.body.campground;
        const campground = await Campground.findByIdAndUpdate(id, updates, {runValidators: true});
        res.redirect(`/campgrounds/${campground._id}`);
    } catch(err) {
        next(err);
    }
}) 

// delete route
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findByIdAndDelete(id);
        res.redirect('/campgrounds');
    } catch(err) {
        next(err);
    }
})
/*****************************/

module.exports = router;