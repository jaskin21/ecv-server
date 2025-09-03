const { v4: uuidv4 } = require('uuid');
const {
  GetCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const { dynamoDB } = require('../config/dynamodb');
const { StatusCodes } = require('http-status-codes');
const { successResponse, errorResponse } = require('../utils/response');

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'expense-tracker';

// Add expense
const addExpense = async (req, res) => {
  try {
    const { description, amount, category } = req.body;

    const id = uuidv4();
    const now = new Date().toISOString();

    const expense = {
      id,
      description,
      amount,
      category: category || 'Other',
      createdAt: now,
      updatedAt: now,
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: expense,
      })
    );

    return successResponse(
      res,
      StatusCodes.CREATED,
      'Expense added successfully',
      expense
    );
  } catch (err) {
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to add expense',
      err.message
    );
  }
};


// const getExpenses = async (req, res) => {
//   try {
//     console.log('Fetching all expenses from table:', TABLE_NAME);

//     const result = await dynamoDB.send(
//       new ScanCommand({ TableName: TABLE_NAME })
//     );

//     return successResponse(
//       res,
//       StatusCodes.OK,
//       'Expenses fetched successfully',
//       result.Items || []
//     );
//   } catch (err) {
//     return errorResponse(
//       res,
//       StatusCodes.INTERNAL_SERVER_ERROR,
//       'Failed to fetch expenses',
//       err.message
//     );
//   }
// };
const getExpenses = async (req, res) => {
  try {
    const { search, category } = req.query;
    console.log('Fetching expenses with search:', search, 'category:', category);

    let params = { TableName: TABLE_NAME };

    if (search || category) {
      const filterExpressions = [];
      const exprAttrValues = {};
      const exprAttrNames = { '#status': 'status' };

      if (search) {
        const searchNumber = Number(search);
        const isNumeric = !isNaN(searchNumber);

        const searchableFields = ['id', 'category', '#status', 'description'];
        filterExpressions.push(
          ...searchableFields.map((field) => `contains(${field}, :search)`)
        );
        exprAttrValues[':search'] = search;

        if (isNumeric) {
          filterExpressions.push('amount = :searchNumber');
          exprAttrValues[':searchNumber'] = searchNumber;
        }
      }

      if (category) {
        filterExpressions.push('category = :category');
        exprAttrValues[':category'] = category;
      }

      params.FilterExpression = filterExpressions.join(' OR ');
      params.ExpressionAttributeValues = exprAttrValues;
      params.ExpressionAttributeNames = exprAttrNames;
    }

    const result = await dynamoDB.send(new ScanCommand(params));

    return successResponse(
      res,
      StatusCodes.OK,
      'Expenses fetched successfully',
      result.Items || []
    );
  } catch (err) {
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to fetch expenses',
      err.message
    );
  }
};



// Get expense by ID
const getExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    if (!result.Item) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'Expense not found');
    }

    return successResponse(
      res,
      StatusCodes.OK,
      'Expense fetched successfully',
      result.Item
    );
  } catch (err) {
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to fetch expense',
      err.message
    );
  }
};

// PATCH: Update expense by id
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = await dynamoDB.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    if (!existing.Item) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'Expense not found');
    }

    let updateExp = [];
    let exprAttrValues = {};
    let exprAttrNames = {};

    Object.keys(updates).forEach((key) => {
      updateExp.push(`#${key} = :${key}`);
      exprAttrValues[`:${key}`] = updates[key];
      exprAttrNames[`#${key}`] = key; // prevent reserved word issues
    });

    updateExp.push(`#updatedAt = :updatedAt`);
    exprAttrValues[':updatedAt'] = new Date().toISOString();
    exprAttrNames['#updatedAt'] = 'updatedAt';

    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExp.join(', ')}`,
        ExpressionAttributeValues: exprAttrValues,
        ExpressionAttributeNames: exprAttrNames,
        ReturnValues: 'ALL_NEW',
      })
    );

    return successResponse(
      res,
      StatusCodes.OK,
      'Expense updated successfully',
      result.Attributes
    );
  } catch (err) {
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to update expense',
      err.message
    );
  }
};


// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check if expense exists
    const existingExpense = await dynamoDB.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    if (!existingExpense.Item) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'Expense not found');
    }

    // 2. Perform delete
    await dynamoDB.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    return successResponse(
      res,
      StatusCodes.OK,
      'Expense deleted successfully',
      { deletedId: id }
    );
  } catch (err) {
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to delete expense',
      err.message
    );
  }
};

// Get summary (total expenses within date range)
const getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'startDate and endDate are required'
      );
    }

    const result = await dynamoDB.send(
      new ScanCommand({ TableName: TABLE_NAME })
    );

    // Filter by date range
    const filteredItems = (result.Items || []).filter((expense) => {
      const createdAt = new Date(expense.createdAt);
      return createdAt >= new Date(startDate) && createdAt <= new Date(endDate);
    });

    // Calculate totals per category
    const totals = filteredItems.reduce((acc, expense) => {
      const cat = expense.category || 'Other';
      acc[cat] = (acc[cat] || 0) + expense.amount;
      return acc;
    }, {});

    // Overall total
    const totalAmount = Object.values(totals).reduce((a, b) => a + b, 0);

    // Calculate percentages per category
    const summaryByCategory = Object.entries(totals).map(([cat, amount]) => {
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      return {
        category: cat,
        amount,
        percentage: Number(percentage.toFixed(2)),
      };
    });

    const responseData = {
      total: totalAmount,
      items: filteredItems.length,
      categories: summaryByCategory,
    };

    return successResponse(
      res,
      StatusCodes.OK,
      'Summary fetched successfully',
      responseData
    );
  } catch (err) {
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to fetch summary',
      err.message
    );
  }
};


module.exports = {
  addExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getSummary,
};
