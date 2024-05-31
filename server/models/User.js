
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userid: {type :Number, unique: true, },
  username: { type: String, required: true, minlength: 3,},
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true, minlength: 6 },
  tokens: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
