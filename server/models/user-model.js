const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String },
  avatarUrl: { type: String },
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String },
})

module.exports =
  mongoose.models.User ||
  mongoose.model('User', UserSchema)
