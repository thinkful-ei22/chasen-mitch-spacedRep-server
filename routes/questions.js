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

// get all questions
router.get('/progress', (req, res, next) => {
  const userId = req.user.id;

  User.findById(userId)
    .populate('questions.qData')
    .then(user => {
      let solved = user.questions.map(a => a.solved);
      //let questions = user.questions.map(a => a.qData.question);
      //let newObj = {};
      //questions.forEach((question, i) => newObj[question] = solved[i]);
      res.json(solved);
    })
    .catch(err => {
      next(err);
    });
});

router.post('/', (req, res, next) => {
  // extract from request
  const {guess} = req.body;
  const userId = req.user.id;
  let feedback;

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
        feedback = true;
      } else {
        question.solved = false;
        question.memValue = 1;
        feedback = false;
      }

      // change head to the value of next
      user.head = question.next;

      // rearrange node order
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
    .then(user => res.status(200).json({feedback, user}));

});

// reset all questions to unsolved and memValue = 1
router.post('/reset', (req, res, next) => {
  const userId = req.user.id;

  User.findById(userId)
    .populate('questions.qData')
    .then(user => {
      let questions = user.questions;
      questions.forEach(function(x) {
        x.solved = false;
        x.memValue = 1;
      });
      return user.save();
    })
    .then(user => {
      let solved = user.questions.map(a => a.solved);
      res.status(200).json({solved,user});
    });
});

module.exports = router;