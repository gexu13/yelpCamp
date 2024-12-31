const BaseJoi = require('joi');
const extension = require('./joiExtension.js');

const Joi = BaseJoi.extend(extension);

const campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
})

module.exports = campgroundSchema;