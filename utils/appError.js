class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // to separate operational error and programming error. All opertional error constains true because
    // we Don't know which type of error we are getting
    this.isOperational = true;
    // work same as track
    // this way when a new object is created, and a constructor function is called,
    // then that function call is not gonna appear in the stack trace, and will not pollute it.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
