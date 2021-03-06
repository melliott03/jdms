var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var User = require('../models/user');
var config = require('./main');
// var User = require('./user');

// Setup work and export for the JWT passport strategy
module.exports = function(passport) {
  console.log('1 INSIDE PASSPORT.AUTHENTICATE::::');
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    console.log('2 INSIDE PASSPORT.AUTHENTICATE::::');
    console.log('jwt_payload::::', jwt_payload._doc._id);
    User.findOne({_id: jwt_payload._doc._id}, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }));
};
