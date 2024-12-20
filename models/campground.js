const mongoose = require('mongoose');
const Review = require('./review');

const ImageSchema = new mongoose.Schema({
    url: String,
    filename: String
});

// https://res.cloudinary.com/daigovpbf/image/upload/w_200/v1734685159/YelpCamp/wlagcf0dpueh3hicgpsd.jpg

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})

const CampgroundSchema = new mongoose.Schema({
    title: String,
    images: [ImageSchema],
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