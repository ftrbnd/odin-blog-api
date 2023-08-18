const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

// called during login/signup
passport.use(new LocalStrategy(User.authenticate()));

// passport.use(
//   new LocalStrategy(async (username, password, done) => {
//     try {
//       const user = await User.findOne({ username: username }).exec();
//       if (!user) {
//         return done(null, false, { message: 'Incorrect username' });
//       }

//       bcrypt.compare(password, user.password, (_err, res) => {
//         if (res) {
//           // passwords match! log user in
//           return done(null, user);
//         } else {
//           // passwords do not match!
//           return done(null, false, { message: 'Incorrect password' });
//         }
//       });
//     } catch (err) {
//       return done(err);
//     }
//   })
// );

// called after logging in / signing up to set user details in req.user
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});
