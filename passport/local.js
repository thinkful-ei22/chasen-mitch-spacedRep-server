const {Strategy: LocalStrategy} = require('passport-local');
const {dbGet} = require('../db-mongoose');
const validatePassword = require('../models/user');

// Define and create basicStrategy
const localStrategy = new LocalStrategy((username, password, done) => {
  let user;
  dbGet().select().from('users').where('username', username)
    .then(([_user]) => {
      user = _user;
      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username',
          location: 'username'
        });
      }
      return validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect password',
          location: 'password'
        });
      }
      return done(null, user);
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return done(null, false, err);
      }
      return done(err, false);
    });
});

module.exports = {localStrategy};