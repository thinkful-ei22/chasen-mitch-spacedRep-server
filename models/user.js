const {dbGet} = require('../db-mongoose.js');
const bcrypt = require('bcryptjs');

const userSchema = new dbGet().Schema({
  firstName: {type:String, required:true},
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type:String, required:true},
  progress: {type:Number,default:0},
  questions: [{
    qData: {type:dbGet().Schema.Types.ObjectId, ref: 'Question'},
    memValue: {type:Number, default:1},
    next: {type:Number},
    attempts: {type:Number, default:0},
    solved: {type:Boolean, default:false}
  }],
  head:{type:Number, default:0}
  // questions: {type:Array} - within the array have 
  // seperate question schema to store initial setup questions
  // when a user registers -> take the questions from the questionschema
  // load the users questions with the ones from questionschema
  // when user logs in -> use the user collection because that has all
  // of the questions within it.
  // mimic the linked list in the array and use it as linked list
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

module.exports = dbGet().model('User', userSchema);