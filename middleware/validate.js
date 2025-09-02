const { StatusCodes } = require('http-status-codes');
const { errorResponse } = require('../utils/response');

module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Validation failed',
        error.details.map((detail) => detail.message)
      );
    }

    next();
  };
};
