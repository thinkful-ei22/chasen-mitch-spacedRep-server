const express = require('express');
const dbGet = require('../db-mongoose.js');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');

router.use(passport.authenticate('jwt', {session: false, failWithError: true}));

router.get('/', (req, res, next) => {
  console.log('req.user', req.user);

  const userId = req.user.id;
  User.findById(userId)
    .populate('questions.question')
    .then(user => {
      res.json(user.questions[user.head].qData.question);
    })
    .catch(err => {
      next(err);
    });
});