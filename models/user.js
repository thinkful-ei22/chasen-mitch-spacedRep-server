const {dbGet} = require('../db-mongoose.js');
const bcrypt = require('bcryptjs');

const userSchema = new dbGet().Schema({
  fullname: String,
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  progress: {type: Number, default: 0}
});

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};

// Add 'createdAt' and 'updatedAt' fields
userSchema.set('timestamps', true);

// Customize output for 'res.json(data)', 'console.log(data)' etc.
userSchema.set('toObject', {
  virtuals: true, // include built-in virtual 'id'
  versionKey: false, // remove '__v' version key
  transform: (doc, ret) => {
    delete ret._id; // delete '_id'
    delete ret.password; // delete 'password'
  }
});

module.exports = mongoose.model('User', userSchema);