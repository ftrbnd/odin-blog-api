require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');

// Set up mongoose connection
mongoose.set('strictQuery', false);
async function connectDb() {
  await mongoose.connect(process.env.MONGODB_URI);
}
connectDb()
  .then(console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB...', err));

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

module.exports = app;
