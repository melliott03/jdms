var express = require("express");
var router = express.Router();
var passport = require("passport");
var path = require("path");
var User = require("../models/user");
var geocoder = require('geocoder');
// var createStripeAccount = require("../modules/stripeCreateAccount");
var stripe = require("stripe")('sk_test_SfT5Rf2DMVfT0unJf7aIIskQ');


router.get("/", function(req,res,next){
    res.sendFile(path.resolve(__dirname, "../public/assets/views/register.html"));
});

router.post("/", function(req, res, next){
    console.log("Made it into register : ", req.body);
    // var user = req.body;
    // console.log("User : ", user);
    geocoder.geocode(req.body.address, function ( err, geocodedData ) {
      var newUserObject = {};
      var geocodedData = geocodedData.results[0].geometry.location;
      var geo = [];
          geo[0]=geocodedData.lat;
          geo[1]=geocodedData.lng;

        newUserObject.geo = geo;
        newUserObject.username = req.body.username;
        newUserObject.password = req.body.password;
        newUserObject.firstname = req.body.firstname;
        newUserObject.lastname = req.body.lastname;
        newUserObject.phone = req.body.phone;
        newUserObject.email = req.body.email;
        newUserObject.address = req.body.address;
        newUserObject.role = req.body.role;
        newUserObject.type = req.body.type;
        newUserObject.epirts;

        var reqbody =req.body;


        console.log("newUserObject.geo : ", newUserObject.geo);


        console.log("newUserObject : ", newUserObject);

    User.create(newUserObject, function(err, user){
        if(err){
          next(err);
        } else {

              //create a stripe account for the user and update user object with token
              // createStripeAccount(user, reqbody);
          // res.redirect("/");
        }
    });
  });//END geocoder.geocode
});

module.exports = router;
