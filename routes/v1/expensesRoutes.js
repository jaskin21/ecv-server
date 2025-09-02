const express = require('express');
const router = express.Router();

const {
  addExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getSummary,
} = require('../../controllers/expenseController');
const validate = require('../../middleware/validate');
const {
  createExpenseSchema,
  updateExpenseSchema,
} = require('../../validation/expenseValidation');

// Routes for expenses
router.get('/', getExpenses);
router.get('/:id', getExpense);
router.post('/', validate(createExpenseSchema), addExpense);
router.patch('/:id', validate(updateExpenseSchema), updateExpense);
router.delete('/:id', deleteExpense);
router.get('/summary/total', getSummary);

module.exports = router;
