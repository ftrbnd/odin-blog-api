const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getToken, getRefreshToken, COOKIE_OPTIONS, verifyUser } = require('../utils/authenticate');

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
  body('username', 'Invalid username').trim().isLength({ min: 3, max: 10 }).escape(),
  body('password', 'Invalid password').trim().isLength({ min: 3, max: 10 }).escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({ message: 'Sign-up validation error', errors: errors.array() });
      } else {
        User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
          if (err) {
            res.statusCode = 500;
            res.send(err);
          } else {
            const token = getToken({ _id: user._id });
            const refreshToken = getRefreshToken({ _id: user._id });
            user.refreshToken.push({ refreshToken });
            user
              .save()
              .then(() => {
                res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
                res.send({ success: true, token });
              })
              .catch((err) => {
                console.error(err);
                res.statusCode = 500;
                res.send(err);
              });
          }
        });
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
      return next(err);
    }
  })
];

exports.log_in = [
  // Validate and sanitize fields.
  body('username', 'Invalid username').trim().isLength({ min: 3, max: 10 }).escape(),
  body('password', 'Invalid password').trim().isLength({ min: 3, max: 10 }).escape(),
  passport.authenticate('local', { session: false }),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const token = getToken({ _id: req.user._id });
    const refreshToken = getRefreshToken({ _id: req.user._id });

    try {
      const user = await User.findById(req.user._id);
      user.refreshToken.push({ refreshToken });
      try {
        await user.save();
        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
        res.send({ success: true, token });
      } catch (err) {
        res.statusCode = 500;
        res.send(err);
      }
    } catch (err) {
      next(err);
    }
  })
];

exports.refresh_token = [
  asyncHandler(async (req, res, next) => {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;

    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const userId = payload._id;
        const user = await User.findById(userId);

        if (user) {
          // Find the refresh token against the user record in database
          const tokenIndex = user.refreshToken.findIndex((item) => item.refreshToken === refreshToken);

          if (tokenIndex === -1) {
            res.statusCode = 401;
            res.send('Unauthorized');
          } else {
            const token = getToken({ _id: userId });
            // If the refresh token exists, then create new one and replace it.
            const newRefreshToken = getRefreshToken({ _id: userId });
            user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };

            try {
              await user.save();
              res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
              res.send({ success: true, token });
            } catch (err) {
              res.statusCode = 500;
              res.send(err);
            }
          }
        } else {
          res.statusCode = 401;
          res.send('Unauthorized');
        }
      } catch (err) {
        next(err);
      }
    } else {
      res.statusCode = 401;
      res.send('Unauthorized');
    }
  })
];

exports.user_detail = [
  verifyUser,
  (req, res) => {
    res.send(req.user);
  }
];

exports.log_out = [
  verifyUser,
  asyncHandler(async (req, res, next) => {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;

    try {
      const user = await User.findById(req.user._id);
      const tokenIndex = user.refreshToken.findIndex((item) => item.refreshToken === refreshToken);

      if (tokenIndex !== -1) {
        user.refreshToken.remove(user.refreshToken[tokenIndex]._id);
      }

      try {
        await user.save();
        res.clearCookie('refreshToken', COOKIE_OPTIONS);
        res.send({ success: true });
      } catch (err) {
        res.statusCode = 500;
        res.send(err);
      }
    } catch (err) {
      next(err);
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
