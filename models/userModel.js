const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, 'Name must be greater then three Charecter'],
    maxlength: [20, 'Name must be less then three Charecter'],
    trim: true,
    require: [true, 'Name must required'],
  },
  email: {
    type: String,
    unqiue: true,
    minlength: 3,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    require: [true, 'please provide a password'],
    minlength: [8, 'password should atleast 8 char'],
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Confirm password Require'],
    validate: {
      validator: (val) => {
        console.log({ val, pass: this.password });
        return val === this.password;
      },
      message: 'Password is Not matched',
    },
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
