
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 3,},
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true, minlength: 6 },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
