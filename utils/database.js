const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
const connection = mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connection.then(console.log('Connected to MongoDB')).catch((err) => console.error('Failed to connect to MongoDB...', err));
