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
  process.env.NODE_ENV === 'production' && ErrorProduction(err, res);
};
