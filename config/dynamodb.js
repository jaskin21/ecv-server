// src/config/dynamodb.js
const {
  DynamoDBClient,
  ListTablesCommand,
  CreateTableCommand,
} = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

const TABLE_NAME = process.env.DYNAMODB_TABLE;
const REGION = process.env.AWS_REGION || 'ap-southeast-1';

// Initialize DynamoDB Client
const client = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Create a Document Client (for JSON-like input/output)
const dynamoDB = DynamoDBDocumentClient.from(client);

/**
 * Ensure DynamoDB table exists
 */
async function ensureTableExists() {
  try {
    const tables = await client.send(new ListTablesCommand({}));

    if (!tables.TableNames.includes(TABLE_NAME)) {
      console.log(`⚠️ Table "${TABLE_NAME}" not found. Creating...`);

      await client.send(
        new CreateTableCommand({
          TableName: TABLE_NAME,
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }], // "id" as the partition key
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          BillingMode: 'PAY_PER_REQUEST', // On-demand billing
        })
      );

      console.log(`✅ Table "${TABLE_NAME}" created successfully.`);
    } else {
      console.log(`✅ Table "${TABLE_NAME}" already exists.`);
    }
  } catch (err) {
    console.error('❌ Error ensuring table:', err);
    throw err;
  }
}

module.exports = { dynamoDB, client, ensureTableExists, TABLE_NAME };
