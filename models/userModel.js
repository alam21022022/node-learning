const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, 'Name must be greater then three Charecter'],
    maxlength: [20, 'Name must be less then three Charecter'],
    required: [true, 'Name must required'],
  },
  email: {
    type: String,
    required: [true, 'Email Required'],
    unique: [true, 'Email must be unique'],
    minlength: 3,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: [8, 'password should atleast 8 char'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirm password Require'],
    validate: {
      validator: function (val) {
        console.log({ val, pass: this.password });
        return val === this.password;
      },
      message: 'Password is Not matched',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  // Only runs this functions if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash password with coast of 12 salt
  // hash is asynchronous function so, we have to awit it
  this.password = await bcrypt.hash(this.password, 12);
  // Delete password confirmation field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//   // { passwordChangedAt: 2022-10-09T00:00:00.000Z } { JWTTimestamp: 1665256134 }
//   // conver passwordChangedAt to JWTTimestamp time formate
//   // base time is 10 inside parseInt
//   if (this.passwordChangedAt) {
//     const changedTimeStamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10
//     );
//     console.log({ JWTTimestamp, changedTimeStamp });
//     return JWTTimestamp < changedTimeStamp;
//   }
//   // False means not changed
//   return false;
// };

userSchema.methods.createPasswordRestToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // this;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
