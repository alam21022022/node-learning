const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 8000;
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const app = express();

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaugth Exception Shutting down ');
  process.exit(1);
});

// Connect to db
mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log('DB connected '));
// .catch((err) => console.log('Error In Connection', { err }));

// middlewares
app.use((req, res, next) => {
  req.visitedAt = new Date().toISOString();
  next();
});

const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController');
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
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global Error
app.use(globalErrorHandler);

const server = app.listen(8000, () => {
  console.log(`Server is running to the port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection Shutting down');
  server.close(() => {
    process.exit(1);
  });
});
