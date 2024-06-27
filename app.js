const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

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
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// set up middleware
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

/**
 * RESTful routes
**/
app.get('/', (req, res) => {
    res.render('home');
})

// index route
app.get('/campgrounds', async (req, res) => {
    const allCamps = await Campground.find({});
    res.render('campgrounds/index', {allCamps});
})

// new campground form route
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// post route
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

// show route
app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);   
    res.render('campgrounds/show', {campground});
})

// update campground form route
app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground});
})

// patch (update and edit) route
app.patch('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const campground = await Campground.findByIdAndUpdate(id, updates, {runValidators: true});
    res.redirect(`/campgrounds/${campground._id}`);
}) 

// delete route
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');

})


app.listen(3000, () => {
    console.log('APP IS LISTENING ON PORT 3000!');
})

