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
var stripe = require("stripe")(process.env.STRIPE_TEST);
var plaid = require('plaid');

var plaidClient = new plaid.Client(process.env.PLAID_CLIENT_ID,
                                   process.env.PLAID_SECRET,
                                   plaid.environments.tartan);

console.log('process.env.PLAID_CLIENT_ID::', process.env.PLAID_CLIENT_ID);
console.log('process.env.PLAID_SECRET::', process.env.PLAID_SECRET);
console.log('process.env.STRIPE_TEST::', process.env.STRIPE_TEST);


var createStripeAccount = function(newTempUser){

        console.log('req.body', req.body);
        console.log('INSIDE stripe/create on server req.body._id:', req.body);
        console.log('newTempUser._id', newTempUser._id);
        console.log('newTempUser', newTempUser);
        console.log('req.connection.remoteAddress::',req.connection.remoteAddress);
        stripe.accounts.create({
          managed: true,
          country: 'US',
          email: user.email,
          tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: req.connection.remoteAddress // Assumes you're not using a proxy
          }
          // ,
          // legal_entity: {
          //   additional_owners: {
          //     // Note the use of an object instead of an array
          //     0: {first_name: 'Bob', last_name: 'Smith'},
          //     1: {first_name: 'Jane', last_name: 'Doe'}
          //   }
          // }
        }, function(err, account) {
          console.log('account:::', account);
          User.findOneAndUpdate({ _id: req.user._id }, { epirts: {id: account.id, keys: account.keys} }, function(err, user) {
            if (err) throw err;

            // we have the updated user returned to us
            console.log('after saving user oooo',user);
          });
          // asynchronously called
          //stripe terms of service acceptance
          // var CONNECTED_STRIPE_ACCOUNT_ID = account.id;
          // stripe.accounts.update(
          //   {CONNECTED_STRIPE_ACCOUNT_ID},
          //   {
          //     tos_acceptance: {
          //       date: Math.floor(Date.now() / 1000),
          //       ip: req.connection.remoteAddress // Assumes you're not using a proxy
          //     }
          //   }
          // );
        });
      };

router.route("/external_ba/")
      .put(function(req, res) {
        // console.log('HELLO FROM PUT ON WORK/ACCEPT');
        console.log('req.user.epirts.id::', req.user.epirts.id);
        console.log('INSIDE stripe/external_ba on server req.body._id:', req.body);
        // console.log('req.user._id', req.user._id);
        // console.log('req.user', req.user);
        // console.log('req.connection.remoteAddress::',req.connection.remoteAddress);
        stripe.accounts.createExternalAccount(
          req.user.epirts.id,
          {external_account: "btok_8Z3QQ90Y7nF4pw"},
          function(err, bank_account) {
            // asynchronously called
          }
        );

      });


module.exports = createStripeAccount;
