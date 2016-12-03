var express = require("express");
var router = express.Router();
var configsty = require('config-node');

var db = require("../modules/db");
// var mongoURI = require("../modules/mongoURI");
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
mongoose.Promise = require('bluebird'); // set Promise provider to bluebird
var Promise = require('bluebird');
var Schema = mongoose.Schema;
var darksky = require('darksky');//not using
// var geocoder = require('geocoder');
var geocoder = Promise.promisifyAll(require('geocoder'));
var restler = require('restler');
// var sugar = require('sugar');
var Agenda = require('agenda');//#AGENDA
var getForecast = require('../modules/forecast');
var stripeChargePay = require('../modules/stripeTransactions');
var stripe = require("stripe")(configsty.STRIPE_TEST);
var workRatesTotal = require('../modules/workRatesTotal');
var workPayTotal = require('../modules/workPayTotal');
var moment = require('moment');

// var restrict = require("../modules/restrict"); // restricts user to be logedin to access route

// ---- Models ---- //
// var Contractor = require('../models/contractor');
var Company = require('../models/company');
// var Company = mongoose.model('Company');
Promise.promisifyAll(Company);
Promise.promisifyAll(Company.prototype);

router.route("/list")
    .get(function(req, res) {
      console.log('INSIDE work/accept on server req.body:', req.body);
      console.log('req.user', req.user);
      var promise = Company.find({}).exec();
      promise.then(function(companies) {
        console.log('companies found::', companies);

        return companies; // returns a promise
      })
      .then(function(companies) {
        res.send(companies);
        // do something with updated work
      })
      .catch(function(err){
        // just need one of these
        console.log('error:', err);
      });
});




module.exports = router;
