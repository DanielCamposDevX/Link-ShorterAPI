import Joi from "joi";

export const urlSchema = Joi.string().uri().min(7).required();