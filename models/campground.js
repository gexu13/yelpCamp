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

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new mongoose.Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
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
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `
        <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
        <p>${this.description.substring(0, 20)}...</p>
    `;
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