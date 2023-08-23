const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Session = new Schema({
  refreshToken: {
    type: String,
    default: ''
  }
});

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 10
    },
    administrator: {
      type: Boolean,
      required: false
    },
    authStrategy: {
      type: String,
      default: 'local'
    },
    refreshToken: {
      type: [Session] // allow multiple devices
    }
  },
  { versionKey: false }
);

UserSchema.set('toJSON', {
  transform: function (_doc, ret) {
    delete ret.refreshToken;
    return ret;
  }
});

UserSchema.plugin(passportLocalMongoose);

UserSchema.virtual('full_name').get(function () {
  return `${this.first_name} ${this.last_name}`;
});

module.exports = mongoose.model('User', UserSchema);
