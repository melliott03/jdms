var express = require("express");
var router = express.Router();
var db = require("../modules/db");
// var mongoURI = require("../modules/mongoURI");
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
// var User = require('../models/user');
// var Contractor = require('../models/contractor');
var User = require('../models/user');
var User = require('../models/user');
var stripe = require("stripe")('sk_test_SfT5Rf2DMVfT0unJf7aIIskQ');

router.route("/create/")
      .put(function(req, res) {
        // console.log('HELLO FROM PUT ON WORK/ACCEPT');
        console.log('req.body', req.body);
        console.log('INSIDE stripe/create on server req.body._id:', req.body);
        console.log('req.user._id', req.user._id);
        console.log('req.user', req.user);

          stripe.accounts.create({
               managed: true,
               country: 'US',
               email: req.user.email
             }, function(err, account) {
               console.log('account:::', account);
               User.findOneAndUpdate({ _id: req.user._id }, { epirtsToken: account.id }, function(err, user) {
                      if (err) throw err;

                      // we have the updated user returned to us
                      console.log('after saving user oooo',user);
                    });
               // asynchronously called
             });

        //


          //   stripe.accounts.create({
          //      managed: true,
          //      country: 'US',
          //      email: 'hello@gmail.com'
          //    }, function(err, account) {
          //      console.log(' INSIDE stripe.accounts.create after save on server account:', account);
          //      console.log(' INSIDE stripe.accounts.create after save on server account:', account.id);
          //     //  user.epirtsToken = account.id;
          //      User.findOneAndUpdate({ _id: req.user._id }, { epirtsToken: account.id }, function(err, user) {
          //        if (err) throw err;
           //
          //        // we have the updated user returned to us
          //        console.log('after saving user oooo',user);
          //      });
           //
          //        // save the user
           //
          //  }, function(err, numberAffected, rawResponse) {
          //     //handle it
          //  });//

      });

module.exports = router;
