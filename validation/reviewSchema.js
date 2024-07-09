const Joi = require('joi');

const reviewSchema = Joi.object({
    body: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5).integer(),
}).required();

module.exports = reviewSchema;