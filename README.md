# Expense Tracker Server

This is the backend server for the Expense Tracker application. It is built with Node.js, Express, and DynamoDB (AWS) as the database.

## Features

- RESTful API for managing expenses (CRUD)
- DynamoDB integration for persistent storage
- Input validation with Joi
- CORS support for frontend integration
- Swagger UI documentation (`/api-docs`)
- Seed script for populating test data

## Project Structure

```
server/
  app.js                # Main Express app
  bin/www               # Server entry point
  config/dynamodb.js    # DynamoDB client setup
  controllers/          # Route handlers (business logic)
  middleware/           # Express middlewares (validation, etc.)
  public/               # Static assets (CSS, images)
  routes/               # Express route definitions
  seed/                 # Data seeding scripts
  utils/                # Utility functions (response helpers)
  validation/           # Joi validation schemas
  views/                # Jade templates for server-rendered pages
  swagger.yaml          # OpenAPI spec for API docs
  package.json          # NPM dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- AWS credentials (for DynamoDB access)
- DynamoDB table (will be created automatically if not present)

### Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-southeast-1
DYNAMODB_TABLE_NAME=expense-tracker
PORT=5000  # You can override the default server port here
```

> **Note:**  
> The server listens on port `5000` by default, but you can override this by setting the `PORT` variable in the `.env` file.

### Install Dependencies

```sh
cd server
npm install
```

### Running the Server

```sh
npm start
```

The server will run on [http://localhost:5000](http://localhost:5000).

### API Documentation

Visit [http://localhost:5000/api-docs](http://localhost:5000/api-docs) for interactive Swagger UI documentation.

### Seeding Test Data

To populate the database with sample expenses:

```sh
npm run seed
```

## Scripts

- `npm start` — Start the server with nodemon
- `npm run seed` — Seed DynamoDB with sample expenses

For more details, see the [swagger.yaml](server/swagger.yaml) file or the code in the [controllers/](server/controllers/) and [routes/](server/routes/) directories.