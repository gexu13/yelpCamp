const express = require('express');
const router = express.Router();
const { requireLogin, validateCampground, checkAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

/***** CAMPGROUND ROUTES *****/
// index route
router.get('/', campgrounds.index)

// new campground form route
router.get('/new', requireLogin, campgrounds.getNewForm)

// post route
router.post('/', requireLogin, 
                 upload.array('image'), 
                 validateCampground, 
                 campgrounds.postNewCampground)

// show route
router.get('/:id', campgrounds.showCampground)

// get campground edit form route
router.get('/:id/edit', requireLogin, checkAuthor, campgrounds.getEditForm)

// patch (update and edit) route
router.patch('/:id', requireLogin, 
                     checkAuthor, 
                     upload.array('image'), 
                     validateCampground, 
                     campgrounds.updateCampground) 

// delete route
router.delete('/:id', requireLogin, checkAuthor, campgrounds.deleteCampground)
/*****************************/

module.exports = router;