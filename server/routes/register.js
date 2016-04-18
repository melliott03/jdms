var express = require("express");
var router = express.Router();
var passport = require("passport");
var path = require("path");
var User = require("../models/user");
var geocoder = require('geocoder');


router.get("/", function(req,res,next){
    res.sendFile(path.resolve(__dirname, "../public/assets/views/register.html"));
});

router.post("/", function(req, res, next){
    // console.log("Made it into register : ", req.body);
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



        console.log("newUserObject.geo : ", newUserObject.geo);


        console.log("newUserObject : ", newUserObject);

    User.create(newUserObject, function(err,post){
        if(err){
          next(err);
        } else {
          res.redirect("/");
        }
    });
  });//END geocoder.geocode
});

module.exports = router;
