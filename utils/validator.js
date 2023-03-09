const joi = require("joi");
const sql = require('../database/mySQL')

const signupSchema = joi.object({
     first_name: joi.string().alphanum().min(3).max(25).trim(true).required(),
     last_name: joi.string().alphanum().min(3).max(25).trim(true).required(),
     email: joi.string().email().lowercase().trim(true).required(),
     pass: joi.string().min(8).trim(true).required(),
     username: joi.string().alphanum().lowercase().min(3).max(25).trim(true).required(),
     gender: joi.string().alphanum().min(3).max(25).trim(true).required(),
});

const loginSchema = joi.object({
    username: joi.string().alphanum().min(3).max(25).trim(true).required(),
    pass: joi.string().min(8).trim(true).required(),
});

module.exports = {signupSchema,loginSchema}