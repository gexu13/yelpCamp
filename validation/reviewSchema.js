const Joi = require('joi');

const reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5).integer(),
    }).required()
})

module.exports = reviewSchema;