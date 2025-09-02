# Leaderboard-API

- [Requirements](#requirements)
- [Node Version](#node-version)
- [Installation](#installation)
- [Run Project](#run-project)
- [Environment](#environment)
- [User Endpoints](#user-endpoints)
- [Others](#0thers)

---

# Requirements

- [Node JS](https://nodejs.org/en)
- [npm](https://www.npmjs.com/)
- [Mongo DB](https://www.mongodb.com/docs/) _(Optional)_

---

---

# Node Version

- v18.16.0

---

# Installation

```sh
npm install
```

---

# Run Project

Once the dependencies are installed:

```sh
npm run start
```

---

# Environment

The Project has its own specific environment variables, just  add `.env` (dot env) file or copy the `.env.example` file and edit their values.

| ENV VARIABLE       | DESCRIPTION                                                                                                                    | TYPE               | REQUIRED | DEFAULT VALUE               |
| :----------------- | :----------------------------------------------------------------------------------------------------------------------------- | :----------------- | :------- | :-------------------------- |
| `DB_CONNECTION`    | For Mongo DB, usually the host                                                                                                 | `string`           | NO       | `mongodb://localhost:27017` |
| `DB_NAME`          | For Mongo DB, the database name                                                                                                | `string`           | YES       | `leaderboard`              |
| `PORT`             | The Port of the Server                                                                                                         | `number`           | NO       | `5000`                      |
| `TOKEN_EXPIRES_IN` | When will the Token expires, expressed in seconds or a string describing a time span                                           | `string \| number` | YES      | N/A                         |
| `TOKEN_SECRET`     | The Token Secret for JWT                                                                                                       | `string`           | YES      | N/A                         |

---

# User Endpoints

## `POST /user`

Creates a user in the db with the coresponding **name**

## Request
```
{
	"name": "Randy"
}	
```

## Response
```
{
  "user": {
    "_id": "5e25bfed830ff6000c7ecb3e",
    "name": "Randy"
  }
}
```
---
## `GET /user/:_id`

Retrieve a user from the db using the coresponding **_id**

## Response
```
{
  "user": {
    "_id": "5e25bfed830ff6000c7ecb3e",
    "name": "Randy"
  }
}
```
---

# Leaderboard Endpoints

## `POST /admin/leaderboard`

Admin endpoint for an instance of the leaderboard. 

### Request
```
{
	"name": "WatchMojo Top 10"
}	

```

### Response
```JSON
{
  "board": {
    "_id": "5e25c253830ff6000c7ecb40",
    "name": "WatchMojo Top 10"
  }
}
```
---

## `GET /leaderboard/:_id?per_page=x&page=y`

Retrieve a leaderboard with a list of entries sorted entries. Where the highest scores is at the top of the list. 

### Response

``` JSON
{
  "board": {
    "_id": "5e25c253830ff6000c7ecb40",
    "name": "WatchMojo Top 10",
    "entries": [
      {
        "score": 70,
        "user_id": "5e25c5cf830ff6000c7ecb43",
        "scored_at": "2020-01-20T15:26:35.115Z",
        "rank": 0,
        "name": "Plurk"
      },
      {
        "score": 40,
        "user_id": "5e25bfed830ff6000c7ecb3e",
        "scored_at": "2020-01-20T15:25:49.955Z",
        "rank": 1,
        "name": "Randy"
      },
      {
        "score": 30,
        "user_id": "5e25c5d9830ff6000c7ecb44",
        "scored_at": "2020-01-20T15:25:10.699Z",
        "rank": 2,
        "name": "Burp"
      },
      {
        "score": 20,
        "user_id": "5e25c5bf830ff6000c7ecb42",
        "scored_at": "2020-01-20T15:40:28.882Z",
        "rank": 3,
        "name": "Derp"
      }
    ]
  }
}
```
---

## `PUT /leaderboard/:_id/user/:user_id/add_score`

Adds `score_to_add` value to the score of the user with the corresponding `user_id`. 

### Request
``` JSON
{
	"score_to_add": 10
}
```

### Response
``` JSON
{
  "entry": {
    "_id": "5e25c608830ff60009268354",
    "board_id": "5e25c253830ff6000c7ecb40",
    "score": 20,
    "scored_at": "2020-01-20T15:40:28.882+00:00",
    "user_id": "5e25c5bf830ff6000c7ecb42"
  }
}
``` 
---


# Others

Other Features added

## Middleware

Implement an API token authentication middleware. For the exam, create the token when creating a user.

## Background Worker for bot accounts

Create a background worker that triggers whenever a user gets first place in a leaderboard. Have a fake user (bot) auto score 10 points every 5 seconds until it overtakes the player. 

# Documentation
- Added ReadMe file describing the framework and setup.
- Give installation instructions if certain frameworks are version sensitive.
- Provide basic instructions to run your exam project.