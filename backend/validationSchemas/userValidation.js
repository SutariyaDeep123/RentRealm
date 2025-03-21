const { body } = require("express-validator");
const Joi = require("joi");

// exports.userLogin = Joi.object({
//     email:Joi.string().trim().required().email().messages({
//         'string.email':"Please enter valid email address",
//         'any.required':"Please enter email address"
//     }),
//     password:Joi.string().required().min(8).pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
// }).options({ stripUnknown: true,abortEarly:false });

exports.userLogin=[
    body('email')
    .notEmpty().withMessage("is required").bail()
    .isEmail().withMessage("please enter valid email"),
]