const {dbGet} = require('../db-mongoose.js');

const questionSchema = new dbGet().Schema({
  question: {type: String, required: true},
  imgURL: {type:String},
  answer: {type: String, required: true},
  explanation: {type: String, required: true}
});

questionSchema.set('toObject', {
  virtuals: true, // include built-in virtual 'id'
  versionKey: false, // remove '__v' version key
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = dbGet().model('Question', questionSchema);