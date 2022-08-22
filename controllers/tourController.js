const express = require('express');
const fs = require('fs');
const path = require('path');
const Tour = require('../models/tourModel');
const APIfeatures = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,duration,difficulty,price,summery,description';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // Execute Query
    const features = new APIfeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const tours = await query
    const tours = await features.query;

    res
      .status(200)
      .json({ status: 'success', results: tours?.length, data: { tours } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id); // new Way
  if (!tour) {
    return next(new AppError(`No tour found with Id ${req.params.id} `, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});

exports.updateTour = async (req, res) => {
  // console.log(req.body);
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.getStats = async (req, res) => {
  // const rating = req.query.rating * 1;
  // console.log({ rating });
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          // _id: `$ratingsAverage`,
          _id: { $toUpper: `$difficulty` },
          // _id: null,
          results: { $sum: 1 },
          totalPrice: { $sum: '$price' },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { averagePrice: -1 },
      },
    ]);
    res.status(200).json({
      status: 'success',
      result: stats.length,
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.monthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-12`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numberOfToursStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: `$_id` },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numberOfToursStarts: -1 },
      },
    ]);
    res.status(200).json({
      status: 'success',
      result: plan.length,
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

/*exports.getTour = catchAsync(async (req, res) => {
  try {
    // const tour = Tour.findOne({ _id: req.params.id }); // old way
    const tour = await Tour.findById(req.params.id); // new Way
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
});

*/
// Crete Tour
// older way
// const newTour = new Tour({});
// newTour.save();
// new Ways
// try {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: { tour: newTour },
//   });
// } catch (err) {
//   res.status(400).json({ status: 'fail', message: err });
// }
// };

// Read the data from dev-data
// const filePath = path.join(
//   __dirname,
//   '..',
//   'dev-data',
//   'data',
//   'tours-simple.json'
// );
// console.log(fs.readFileSync(filePath));
// const tours = JSON.parse(fs.readFileSync(filePath));

// Build Query
// 1 A) Filtring
// const queryObj = { ...req.query };
// const excludedFields = ['sort', 'page', 'limit', 'fields'];
// excludedFields.forEach((el) => delete queryObj[el]);

// 1 B) Advance Filtering
// In mongoDB we get data in the form of { difficulty: 'easy', duration: { $gte: '100' } }
// But in actual { difficulty: 'easy', duration: { gte: '100' } }
// let queryString = JSON.stringify(queryObj);
// queryString = queryString.replace(
//   /\b(gte|gt|lte|lt)\b/g,
//   (match) => `$${match}`
// );
// let query = Tour.find(JSON.parse(queryString));

// 2. Sorting
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(sortBy);
//   // If you want to sort by two variables then you can In this formate
//   // sort(price ratingsAverage)
// } else {
//   // sort based on created at
//   query = query.sort('-createdAt');
// }

// // 3. Field Limiting
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

// 4. Pagination
// const page = req.query.page * 1;
// const limit = req.query.limit * 1;
// const skip = (page - 1) * limit;

// query = query.skip(skip).limit(limit);

// What if we move to next page and data didn't exist
// const numTours = await Tour.countDocuments();

// if (skip >= numTours) {
//   throw new Error('This page is not exist');
// }
