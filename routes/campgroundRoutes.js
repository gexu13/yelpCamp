const Campground = require('../models/campground');
const express = require('express');
const router = express.Router();
const { requireLogin, validateCampground, checkAuthor } = require('../middleware');


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
router.get('/new', requireLogin, (req, res) => {
    res.render('campgrounds/new');
})

// post route
router.post('/', requireLogin, validateCampground, async (req, res, next) => {
    try {
        // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
        const campground = new Campground(req.body.campground);
        // set the current user as the author of the new campground
        campground.author = req.user._id;
        await campground.save();
        req.flash('success', 'Successfully made a new campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch(err) {
        next(err);
    }
    
})

// show route
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id)
                                .populate({
                                    path: 'reviews',
                                    populate: {path: 'author'}
                                })
                                .populate('author'); 
        if (!campground) {
            req.flash('error', 'Cannot find the campground!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show', {campground});
    } catch(err) {
        next(err);
    }
    
})

// get campground edit form route
router.get('/:id/edit', requireLogin, checkAuthor, async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        if (!campground) {
            req.flash('error', 'Cannot find the campground!');
            return res.redirect('/campgrounds');
        }  
        res.render('campgrounds/edit', {campground});
    } catch(err) {
        next(err);
    }
    
})

// patch (update and edit) route
router.patch('/:id', requireLogin, checkAuthor, validateCampground, async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body.campground;
        const campground = await Campground.findByIdAndUpdate(id, updates, {runValidators: true});
        req.flash('success', 'Successfully updated the campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch(err) {
        next(err);
    }
}) 

// delete route
router.delete('/:id', requireLogin, checkAuthor, async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findByIdAndDelete(id);
        req.flash('success', 'Successfully deleted the campground!');
        res.redirect('/campgrounds');
    } catch(err) {
        next(err);
    }
})
/*****************************/

module.exports = router;