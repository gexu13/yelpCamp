const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

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



app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campground/new', async (req, res) => {
    const camp = new Campground({
        title: 'My Backyard',
        description: 'Cheap camping!'
    })
    await camp.save();
    res.send(camp);
}) 

app.listen(3000, () => {
    console.log('APP IS LISTENING ON PORT 3000!');
})

