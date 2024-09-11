const Review = require('../models/review');
const Campground = require('../models/campground.js')
const express = require('express');
const router = express.Router({mergeParams: true});
const { validateReview } = require('../middleware.js')


/***** REVIEW ROUTES *****/
// create a new reivew for the given campground
router.post('/', validateReview, async (req, res, next) => {
    try {
        const { cid } = req.params;
        const campground = await Campground.findById(cid);
        const review = new Review(req.body.review);
        campground.reviews.push(review);
        await campground.save();
        await review.save();
        req.flash('success', 'Successfully made a new review!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (err) {
        next(err);
    }
})

// delete a review for the given campground
router.delete('/:rid', async (req, res, next) => {
    const { cid , rid } = req.params;
    const campground = await Campground.findByIdAndUpdate(cid, {$pull : {reviews: rid}});
    const review = await Review.findByIdAndDelete(rid);
    req.flash('success', 'Successfully deleted the review!');
    res.redirect(`/campgrounds/${cid}`);

} )
/*************************/


module.exports = router;