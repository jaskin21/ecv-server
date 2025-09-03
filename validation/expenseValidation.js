const Joi = require('joi');

// For creating a new expense (all required)
const createExpenseSchema = Joi.object({
  description: Joi.string().min(3).max(100).required(),
  amount: Joi.number().positive().required(),
  category: Joi.string().valid('Food', 'Transport', 'Entertainment', 'Utilities', 'Other').required(),
});

// For updating an expense (also all required)
const updateExpenseSchema = Joi.object({
  description: Joi.string().min(3).max(100).optional(),
  amount: Joi.number().positive().optional(),
  category: Joi.string()
    .valid('Food', 'Transport', 'Entertainment', 'Utilities', 'Other')
    .optional(),
});

module.exports = { createExpenseSchema, updateExpenseSchema };
