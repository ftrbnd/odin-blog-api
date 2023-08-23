if (process.env.NODE_ENV !== 'production') {
  // Load environment variables from .env file in non prod environments
  require('dotenv').config();
}

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');

require('./utils/database');
require('./utils/authenticate');
require('./strategies/JwtStrategy');
require('./strategies/LocalStrategy');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();

const whitelist = process.env.WHITELISTED_DOMAINS ? process.env.WHITELISTED_DOMAINS.split(',') : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors(corsOptions));
app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/api', apiRouter);

const server = app.listen(process.env.PORT || 3000, () => {
  const port = server.address().port;

  console.log('App started at port', port);
});
