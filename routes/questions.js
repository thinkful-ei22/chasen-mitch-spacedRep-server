const express = require('express');
const {dbGet} = require('../db-mongoose.js');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');

router.use(passport.authenticate('jwt', {session: false, failWithError: true, useNewUrlParser: true}));


// get question at head
router.get('/', (req, res, next) => {
  const userId = req.user.id;

  if (!dbGet().Types.ObjectId.isValid(userId)) {
    const err = new Error('Invalid user');
    err.status = 400;
    return next(err);
  }

  console.log(userId);
  // ==> get next question
  User.findById(userId)
    .populate('questions.qData')
    .then(user => {
      res.json(user.questions[user.head].qData);
    })
    .catch(err => {
      next(err);
    });
});

// get all questions
router.get('/all', (req, res, next) => {
  const userId = req.user.id;

  User.findById(userId)
    .populate('questions.qData')
    .then(user => {
      res.json(user.questions);
    })
    .catch(err => {
      next(err);
    });
});

router.post('/', (req, res, next) => {
  // extract from request
  const {guess} = req.body;
  const userId = req.user.id;

  User.findById(userId)
    .populate('questions.qData')
    .then(user => {
      // set up data
      let index = user.head;
      let question = user.questions[index];
      let answer = question.qData.answer;
      question.attempts++;

      // compare guess with answer
      if (guess.toLowerCase() === answer) {
        question.solved = true;
        question.memValue *= 2;
      } else {
        question.memValue = 1;
      }

      // change head to the value of next
      if (user.head === null) {
        user.head = 0;
      } else {
        user.head = question.next;
      }

      let currentQuestion = question;
      for (let i = 0; i < question.memValue; i++) {
        const nextIndex = currentQuestion.next;
        if (nextIndex === null) {
          break;
        }
        currentQuestion = user.questions[nextIndex];
      }
      question.next = currentQuestion.next;
      currentQuestion.next = index;
      return user.save();
    })
    .then(() => res.status(200).json({}));

});

module.exports = router;