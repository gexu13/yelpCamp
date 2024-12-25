const Campground = require('../models/campground')
const cloudinary = require('cloudinary').v2;
const maptilerToken = process.env.maptiler_apiKey
const axios = require('axios');

exports.index = async (req, res, next) => {
    try {
        const allCamps = await Campground.find({});
        res.render('campgrounds/index', {allCamps});
    } catch(err) {
        next(err);
    } 
}

exports.getNewForm = (req, res) => {
    res.render('campgrounds/new');
}

exports.postNewCampground = async (req, res, next) => {
    try {
        // get the location from the form and use it to get the geo data
        const location = req.body.campground.location;
        const url = `https://api.maptiler.com/geocoding/${location}.json?key=${maptilerToken}`;
        const geoData = await axios.get(url);
        geometry = geoData.data.features[0].geometry; // [lng, lat]
        // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
        const campground = new Campground(req.body.campground);
        // add the geometry data to the campground
        campground.geometry = geometry;
        // set the current user as the author of the new campground
        campground.author = req.user._id;
        // add images info to the campground
        const images = req.files.map(e => ({
            url : e.path, 
            filename: e.filename
        }));
        campground.images = images
        await campground.save();
        console.log(campground.geometry);
        req.flash('success', 'Successfully made a new campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch(err) {
        next(err);
    }
}

exports.showCampground = async (req, res, next) => {
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
    
}

exports.getEditForm = async (req, res, next) => {
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
}

exports.updateCampground = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body.campground;
        // add updated images info to the existing campground
        const images = req.files.map(e => ({
            url : e.path, 
            filename: e.filename
        }));
        // find the campground and update it
        const campground = await Campground.findByIdAndUpdate(id, updates, {runValidators: true});
        // add the new images to the campground
        campground.images.push(...images);
        await campground.save();

        if (req.body.deleteImages) {
            // delete the images from cloudinary
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            // delete the images from the campground
            await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
        }

        req.flash('success', 'Successfully updated the campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch(err) {
        next(err);
    }
}

exports.deleteCampground = async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findByIdAndDelete(id);
        req.flash('success', 'Successfully deleted the campground!');
        res.redirect('/campgrounds');
    } catch(err) {
        next(err);
    }
}