const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {JWT_SECRET,JWT_EXPIRY} = require('../config');
const options = {session: false, failWithError: true};
const bodyParser = require('body-parser');

// Create auth token
const createAuthToken = user => {
  return jwt.sign({user}, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

// Use Local Auth
const localAuth = passport.authenticate('local', options);
// Use JWT Auth
const jwtAuth = passport.authenticate('jwt', {session: false});
router.use(bodyParser.json());
// POST Protected Login endpoint
router.post('/', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  return res.json({authToken});
});

// POST Protected Refresh endpoint
router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({authToken});
});

module.exports = router;