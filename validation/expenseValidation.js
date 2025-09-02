const Joi = require('joi');

// For creating a new expense (all required)
const createExpenseSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  amount: Joi.number().positive().required(),
});

// For updating an expense (also all required)
const updateExpenseSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  amount: Joi.number().positive().required(),
});

module.exports = { createExpenseSchema, updateExpenseSchema };
