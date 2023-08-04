const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      maxLength: 10
    },
    password: {
      type: String,
      required: true
    },
    administrator: {
      type: Boolean,
      required: false
    }
  },
  { versionKey: false }
);

UserSchema.virtual('full_name').get(function () {
  return `${this.first_name} ${this.last_name}`;
});

module.exports = mongoose.model('User', UserSchema);
