const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB Connnected '))
  .catch((err) => console.log({ err }));

// Get all data

const toursData = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`));
const addData = async () => {
  try {
    await Tour.create(toursData);
    console.log('Data added ');
  } catch (err) {
    console.log({ err });
  }
  process.exit();
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('DATA Deleted');
  } catch (err) {
    console.log({ err });
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  addData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
