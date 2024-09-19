const express = require('express');
const router = express.Router({mergeParams: true});
const { validateReview, requireLogin, checkReviewAuthor } = require('../middleware.js')
const reviews = require('../controllers/reviews.js')

/***** REVIEW ROUTES *****/
// create a new reivew for the given campground
router.post('/', requireLogin, validateReview, reviews.createReview)

// delete a review for the given campground
router.delete('/:rid', requireLogin, checkReviewAuthor, reviews.deleteReview)
/*************************/


module.exports = router;