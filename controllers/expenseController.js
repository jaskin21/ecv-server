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
    const { title, amount } = req.body;

    // Generate UUID
    const id = uuidv4();
    const now = new Date().toISOString();

    // Build the expense object
    const expense = {
      id,
      title,
      amount,
      createdAt: now,
      updatedAt: now,
    };

    // Save to DynamoDB
    await dynamoDB.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: expense,
      })
    );

    // Success response
    return successResponse(
      res,
      StatusCodes.CREATED,
      'Expense added successfully',
      expense
    );
  } catch (err) {
    // Error response
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to add expense',
      err.message
    );
  }
};

const getExpenses = async (req, res) => {
  try {
    console.log('Fetching all expenses from table:', TABLE_NAME);

    const result = await dynamoDB.send(
      new ScanCommand({ TableName: TABLE_NAME })
    );

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

    // 1. Check if expense exists
    const existing = await dynamoDB.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    if (!existing.Item) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'Expense not found');
    }

    // 2. Build dynamic UpdateExpression
    let updateExp = [];
    let exprAttrValues = {};

    Object.keys(updates).forEach((key) => {
      updateExp.push(`${key} = :${key}`);
      exprAttrValues[`:${key}`] = updates[key];
    });

    // Always update updatedAt
    updateExp.push(`updatedAt = :updatedAt`);
    exprAttrValues[':updatedAt'] = new Date().toISOString();

    if (updateExp.length === 1) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'No valid fields provided for update'
      );
    }

    // 3. Perform update
    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExp.join(', ')}`,
        ExpressionAttributeValues: exprAttrValues,
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

// Get summary (total expenses)
const getSummary = async (req, res) => {
  try {
    const result = await dynamoDB.send(
      new ScanCommand({ TableName: TABLE_NAME })
    );
    const total = result.Items.reduce((sum, item) => sum + item.amount, 0);

    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
