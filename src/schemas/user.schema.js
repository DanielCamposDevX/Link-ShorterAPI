import Joi from "joi"

export const signupSchema = Joi.object({
    name: Joi.string().min(1).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).min(1).required(),
    password: Joi.string().required().min(3)
})

export const emailSchema = Joi.string().email({ minDomainSegments: 2 }).min(1).required();