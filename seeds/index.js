const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers'); 


// connect to DB
mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
.then(() => {
    console.log("Connected to the Database!");
})
.catch(err => {
    console.log("OH NO ERROR!");
    console.log(err);
})


// helper function
// helper to create a random index in an array
const generateIndex = (array) => {
    return Math.floor(Math.random() * array.length);
}


// create seeds for development
const seedDB = async function() {
    await Campground.deleteMany({}); // clear the campground collection

    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000); // 0 - 999
        const camp = new Campground({
            title: `${descriptors[generateIndex(descriptors)]} ${places[generateIndex(places)]}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`
        });
        await camp.save();
    }

}

seedDB().then(() => {
    mongoose.connection.close();
});