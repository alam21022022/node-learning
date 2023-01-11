const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  const token = signToken(newUser?._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. check email and password exist
  if (!email || !password) {
    return next(new AppError('Please Provide Email and Password', 400));
  }
  // 2. Check if user exist and password is correct
  const user = await User.findOne({ email: email }).select('+password');
  console.log({ user });
  if (!user || !(await user.correctPassword(password, user?.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3. If everything ok send token to client
  const token = signToken(user?._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Four steps need to follow

  // 1. Getting tokens and check Of its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(`You are not logged In, Please Login to get access`, 401)
    );
  }
  // 2. Verification of tokens with payload(_id)
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log({ decode });
  // { id: '63159f9f04aa0003f9d3d4c2', iat: 1664780761, exp: 1672556761 }
  // iat ==> Initialted At
  // 3. Check if User Still exists
  const currentUser = await User.findById(decode?.id);
  if (!currentUser) {
    return next(
      new AppError(`The User belonging to this token does no longer exist`, 401)
    );
  }
  // 4. Check if user changed password after JWT was issued
  // 1. first we create instance method for that In model
  // video 132
  // remember that we can call this instance method
  // on a user document.
  // So currentUser.changedPasswordAfter,
  // console.log({ res: currentUser.changedPasswordAfter(decode.iat) });
  // if (currentUser.changedPasswordAfter(decode.iat)) {
  //   return next(
  //     new AppError(`User recently changed password! please login again`, 401)
  //   );
  // }

  // Grant access to the protected routes
  req.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You have no permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get the user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }
  //2. generate the random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  next();
});
