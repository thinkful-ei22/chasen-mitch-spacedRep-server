const express = require('express');
const router = express.Router();
const {dbGet} = require('../db-mongoose'); 
const {User, hashPassword} = require('../models/user');
const emailValidator = require('email-validator');

// // GET all users
// router.get('/', (req, res, next) => {
//   dbGet().select('id', 'username', 'email')
//     .from('users')
//     .then(results => {
//       res.json(results);
//     })
//     .catch(err => next(err));
// });

// // GET user by ID
// router.get('/:id', (req, res, next) => {
//   const {id} = req.params;
//   dbGet().select('id', 'username', 'email')
//     .from('users').where('id', id)
//     .then(([user]) => {
//       if(user) {
//         res.json(user);
//       } else {
//         next();
//       }
//     })
//     .catch(err => next(err));
// });

// POST to create a user
router.post('/', (req, res, next) => {
  let {firstName, username, password, email} = req.body;
  const requiredFields = ['username', 'password', 'email'];
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
      min: 8,
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

  let digest;

  User.find({username}).count().then(count => {
    if(count > 0){
      return Promise.reject({
        code: 400,
        reason: 'ValidationError',
        message: `Username of ${username} already exists, try again`,
        location: 'username'
      });
    }
    return User.hashPassword(password);
  })
    .then((_digest) => { 
      digest = _digest;
      const newUser = { firstName, username, email, password: digest };
      return User.create(newUser);
    })
    .then(result => {res.status(201).loction(`/api/users/${result.id}`).json(result);})
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      next(err);
    });
});

module.exports = router;