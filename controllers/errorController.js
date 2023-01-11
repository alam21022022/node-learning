const AppError = require('.././utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate Field Value: '${err.keyValue.name}' Please Use another Value`;
  return new AppError(message, 400);
};

const handleValidationErrorDb = (err) => {
  const value = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');
  const message = `Invalid Input: ${value}`;
  return new AppError(message, 400);
};

const handleTokenError = (err) => {
  return new AppError(`Invalid token. Please login again !`, 401);
};

const handleTokenExpireError = (err) => {
  return new AppError(`Token Expired. Please login again !`, 401);
};

const ErrorProduction = (err, res) => {
  // Operational Trusted Error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknow error Don't leak to the client
  } else {
    // 1. log the error
    console.error('Error', err);
    // 2. Send generic error
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong ',
      error: err,
    });
  }
};

const ErrorDevelopment = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  process.env.NODE_ENV === 'development' && ErrorDevelopment(err, res);
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.name = err.name;
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError')
      error = handleValidationErrorDb(error);
    if (error.name === 'JsonWebTokenError') error = handleTokenError(error);

    if (error.name === 'TokenExpiredError')
      error = handleTokenExpireError(error);
    ErrorProduction(error, res);
  }
};
