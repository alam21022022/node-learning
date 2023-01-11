const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, 'A name must be unique'],
      required: [true, 'A tour must have a Name'],
      maxlength: [20, 'A tour length must be less then or equal to 40'],
      minlength: [10, 'A tour length must be greater then or equal to 10'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a Duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either medium, easy, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'A Rating should not be more then 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        //val ==> price discount me jo val aaiga wahe hai
        validator: function (val) {
          // this only point to the current on New Document Creation
          return this.price > val;
        },
        message: 'Discount Price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },

    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a imageCovers'],
    },
    images: [String],
    // hide the created at
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Mongoose Middleware

// 1. Document Middleware (It will only works create and save)

// tourSchema.pre("save", function(next) {
//   this.slug = slugify(this.name, { lower: true })
//   console.log(this); //this will give you the access of document before saving
//   next()
// })

// tourSchema.post("save", function(doc, next) {
//   next()
// })

// 2. Query Middleware

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`This Query Taken ${Date.now() - this.start} milliseconds`);
  next();
});

// 3. Aggregate Middleware

// tourSchema.pre('aggregate', function (next) {
//   console.log(
//     this.pipeline().unshift({
//       $match: {
//         secretTour: { $ne: true },
//       },
//     })
//   );
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
