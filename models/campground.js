const mongoose = require('mongoose');
const Review = require('./review');

const CampgroundSchema = new mongoose.Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

CampgroundSchema.post('findOneAndDelete', async(campground) => {
    if (campground) {
        campground.reviews.forEach(async review => {
            await Review.findByIdAndDelete(review);
        });
    }
})

const Campground = mongoose.model('Campground', CampgroundSchema);

module.exports = Campground;