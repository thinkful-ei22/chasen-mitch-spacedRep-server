const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Question = require('../models/question');
const emailValidator = require('email-validator');

// POST to create a user
router.post('/', (req, res, next) => {
  let {firstName, username, password, email} = req.body;
  const requiredFields = ['firstName', 'username', 'password', 'email'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    const err = new Error(`${missingField} in request body`);
    err.status = 422;
    return next(err);
  }

  const stringFields = ['username', 'password', 'firstName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string ',
      location: nonStringField
    });
  }

  const explicitlyTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]);

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 5
    },
    password: {
      min: 10,
      max: 72
    }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field => 'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min);
  const tooLargeField = Object.keys(sizedFields).find(
    field => 'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max);

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must bet at most ${sizedFields[tooLargeField].min} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  const validEmail = (!emailValidator.validate(email));

  if(validEmail) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Not a valid email address',
      location: validEmail
    });
  }

  let _questions;

  Question.find({}, function(err, questions) {
    let questionMap = {};

    questions.forEach(function(question) {
      questionMap[question._id] = question;
    });
    console.log(questionMap);
    return questionMap;
  })
    .then(questions => _questions = questions.map(question => ({question: question})))
    .then(() => {
      for(let i=0; i < _questions.length; i++){
        if (i === _questions.length-1) {
          _questions[i].memValue = 9;
          _questions[i].next = 0;
        } else {
          _questions[i].memValue = i;
          _questions[i].next = i+1;
        }
      }
      return User.hashPassword(password);
    })
    .then(digest => {
      const newUser = {firstName, username, email, questions: _questions, password: digest}; 
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201).location(`/api/users/${result.id}`).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('Username already taken');
        err.status = 422;
        err.reason = 'ValidationError';
        err.location = 'username';
      }
      next(err);
    });

  // let user = {};
  // const userPromise = User.hashPassword(password)
  //   .then(digest => {
  //     const newUser = {firstName, username, email, password: digest};
  //     return User.create(newUser);
  //   });
  // const questionPromise = Question.find();

  // return Promise.all([userPromise, questionPromise])
  //   .then(([user, questions]) => {
  //     const qObj = {questions: []};
  //     console.log('user:', user);
  //     for(let i=0; i < questions.length; i++) {
  //       qObj.questions.push({
  //         questionId: questions[i].id,
  //         next: (i + 1) % questions.length
  //       });
  //     }
  //     return User.findByIdAndUpdate(user.id, qObj, {new: true});
  //   })
  //   .then(newUser => {
  //     user = newUser;
  //     return res.location(`${req.originalUrl}/${user.id}`).status(201).json(user);
  //   })
  //   .catch(err => {
  //     if (err.code === 11000) {
  //       err = new Error('Username already taken');
  //       err.status = 422;
  //       err.reason = 'ValidationError';
  //       err.location = 'username';
  //     }
  //     next(err);
  //   });


});

module.exports = router;