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

app.listen(8000, () => {
  console.log(`Server is running to the port ${PORT}`);
});
