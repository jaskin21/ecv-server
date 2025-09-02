const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamoDB } = require('../config/dynamodb');
const { expenses } = require('./data');

const DYNAMODB_TABLE_NAME =
  process.env.DYNAMODB_TABLE_NAME || 'expense-tracker';

const seed = async () => {
  try {
    console.log('dynamoDB object:', dynamoDB);

    for (const expense of expenses) {
      await dynamoDB.send(
        new PutCommand({
          TableName: DYNAMODB_TABLE_NAME,
          Item: expense,
        })
      );
      console.log(`✅ Inserted expense: ${expense.title}`);
    }
    console.log('✅ Seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
