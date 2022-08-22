const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 8000;
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Connect to db
mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log('DB connected '))
  .catch((err) => console.log('Error In Connection', { err }));

// middlewares
app.use((req, res, next) => {
  req.visitedAt = new Date().toISOString();
  next();
});

const tourRoutes = require('./routes/tourRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

// app.use();
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));

// own middleware
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

// Handling Unhandled Routes
app.all('*', (req, res, next) => {
  /*
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`,
  });
  */
  // Define Error message
  const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // Define Error Status Code
  err.status = 'fail';
  err.statusCode = 404;
  /*
  so that our error handling middleware
  can then use them in the next step.
  Q. But now, how do we actually read that In next step?
  Ans : next middleware. So, when ever we pass anything or arguments In next function,
        no matter what it is,
        Express will automatically assume that It gonna be an error.
        And that applies to every next function in every single middleware anywhere in our application.
  */
  next(err);
});

// Global error handler (that catch part in all routes handler)
// ye err or 4 argument ko dekh kr he pahchaan jaiga k ye global error handler hai
// 500 is use for Network error
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

app.listen(8000, () => {
  console.log(`Server is running to the port ${PORT}`);
});
