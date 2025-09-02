const { StatusCodes, getReasonPhrase } = require('http-status-codes');

const successResponse = (
  res,
  statusCode = StatusCodes.OK,
  message = null,
  data = null
) => {
  return res.status(statusCode).json({
    status: 'success',
    code: statusCode,
    message: message || getReasonPhrase(statusCode),
    data,
  });
};

const errorResponse = (
  res,
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  message = null,
  errors = null
) => {
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: message || getReasonPhrase(statusCode),
    errors,
  });
};

module.exports = { successResponse, errorResponse };