const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const passport = require('passport');

exports.users_index = asyncHandler(async (_req, res) => {
  try {
    const users = await User.find({}, 'username').sort({ username: 1 }).exec();

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

exports.sign_up = [
  // Validate and sanitize fields.
  body('username', 'Invalid username').trim().isLength({ min: 1 }).escape(),
  body('password', 'Invalid password').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      bcrypt.hash(req.body.password, 10, async (_err, hashedPassword) => {
        // Create User object with escaped and trimmed data
        const user = new User({
          username: req.body.username,
          password: hashedPassword
        });

        if (!errors.isEmpty()) {
          res.status(400).json({ message: 'Sign-up validation error', errors: errors.array() });
        } else {
          await user.save();
          res.json(user);
        }
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
      return next(err);
    }
  })
];

exports.log_in = [
  body('username', 'Invalid username').trim().isLength({ min: 1 }).escape(),
  body('password', 'Invalid password').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({ message: 'Log-in validation error', errors: errors.array() });
      } else {
        passport.authenticate('local', {
          successRedirect: '/api/users',
          failureRedirect: '/api/users/login'
        })(req, res, next);
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
      return next(err);
    }
  })
];

exports.user_get = [
  getUser,
  (_req, res) => {
    res.json(res.user);
  }
];

exports.user_update = [
  getUser,
  async (req, res) => {
    if (req.body.username) {
      res.user.username = req.body.username;
    }

    try {
      const updatedUser = await res.user.save();
      res.json(updatedUser);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
];

exports.user_delete = [
  getUser,
  async (_req, res) => {
    try {
      await User.findByIdAndDelete(res.user._id);
      res.json({ message: 'Deleted User' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];

// Custom middleware for getting a specific user
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.user = user;
  next();
}
