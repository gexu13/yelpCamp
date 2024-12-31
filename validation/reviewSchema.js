const BaseJoi = require('joi');
const extension = require('./joiExtension.js');

const Joi = BaseJoi.extend(extension);

const reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().escapeHTML(),
        rating: Joi.number().required().min(1).max(5).integer(),
    }).required()
})

module.exports = reviewSchema;