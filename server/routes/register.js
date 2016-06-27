var express = require("express");
var router = express.Router();
var passport = require("passport");
var path = require("path");
var User = require("../models/user");
var User_TempInvited = require("../models/user_invited");
var geocoder = require('geocoder');
// var createStripeAccount = require("../modules/stripeCreateAccount");
var stripe = require("stripe")('sk_test_SfT5Rf2DMVfT0unJf7aIIskQ');
var mongoose = require("mongoose");
var nev = require('email-verification')(mongoose);
var nev2nd = require('email-verification')(mongoose);


//EMAIL VARIFICATION
nev.configure({
   verificationURL: 'https://80cafa98.ngrok.io/register/email-verification/${URL}',
   persistentUserModel: User,
   tempUserCollection: 'work_tempusers',

   transportOptions: {
       service: 'Gmail',
       auth: {
           user: 'modespeaking@gmail.com',
           pass: 'gwtexvqycbstxzvf'
       }
   },
   passwordFieldName: 'password',

   verifyMailOptions: {
       from: 'Do Not Reply <myawesomeemail_do_not_reply@gmail.com>',
       subject: 'Please confirm account',
       html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
       text: 'Please confirm your account by clicking the following link: ${URL}'
   }
});
nev.generateTempUserModel(User, function(err, tempUserModel) {
  console.log('inside nev.generateTempUserModel', tempUserModel);

  if (err) {
    console.log(err);
    return;
  }

  console.log('generated temp user model: ' + (typeof tempUserModel === 'function'));
});

// user accesses the link that is sent
router.get('/email-verification/:URL', function(req, res) {
  var url = req.params.URL;
  console.log('url', url);
  nev.confirmTempUser(url, function(err, user) {
    if (user) {
      nev.sendConfirmationEmail(user.email, function(err, info) {
        if (err) {
          return res.status(404).send('ERROR: sending confirmation email FAILED');
        }
        res.json({
          msg: 'CONFIRMED!',
          info: info
        });
      });
    } else {
      return res.status(404).send('ERROR: confirming temp user FAILED');
    }
  });
});

// user accesses the link that is sent
router.get('/invite-verification/:URL', function(req, res) {
  var url = req.params.URL;
  console.log('url', url);
  nev2nd.confirmTempUser(url, function(err, user) {

    if (user) {
      console.log('user', user);
      nev2nd.sendConfirmationEmail(user.email, function(err, info) {
        if (err) {
          return res.status(404).send('ERROR: sending confirmation email FAILED: ' + err);
        }
        // res.json({
        //   msg: 'CONFIRMED!',
        //   info: info
        // });
        res.redirect("/");
      });
    } else {
      return res.status(404).send('ERROR: confirming temp user FAILED: '+err);
    }
  });
});

router.get("/", function(req,res,next){
    res.sendFile(path.resolve(__dirname, "../public/assets/views/register.html"));
});

router.post("/", function(req, res, next){
    console.log("Made it into register : ", req.body);

    // var user = req.body;
    // console.log("User : ", user);
    var email = req.body.email;
    var pw = req.body.password;
    var password = req.body.password;

    // register button was clicked
if (req.body.action === 'signup') {
  if (req.body.action === 'signup') {
    var password = req.body.password;
    var newUser = new User({
      username: req.body.username,
      email: email,
      password: password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phone: req.body.phone,
      address: req.body.address,
      role: req.body.role,
      type: req.body.type,
      epirts: ''
    });
    var agentAddress = '5650 Humboldt Avenue North Minneapolis, MN 55430'
    geocoder.geocode(agentAddress, function ( err, geocodedData ) { //req.body.address
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
        console.log("User inside register.js: ", User);


        console.log('newUserObject: ' , newUserObject);

        nev.createTempUser(newUser, function(err, newTempUser) {
          console.log('inside nev.createTempUser', newUser);
          if (err) {
            return res.status(404).send('ERROR: creating temp user FAILED: ' + err);
          }

          // new user created
          if (newTempUser) {
            var URL = newTempUser[nev.options.URLFieldName];

            nev.sendVerificationEmail(email, URL, function(err, info) {
              if (err) {
                return res.status(404).send('ERROR: sending verification email FAILED: '+ err);
              }
              res.json({
                msg: 'An email has been sent to you. Please check it to verify your account.',
                info: info
              });
            });

          // user already exists in temporary collection!
          } else {
            res.json({
              msg: 'You have already signed up. Please check your email to verify your account.'
            });
          }
        });

    // User.create(newUserObject, function(err, user){
    //     if(err){
    //       next(err);
    //     } else {
    //
    //           //create a stripe account for the user and update user object with token
    //           // createStripeAccount(user, reqbody);
    //       // res.redirect("/");
    //     }
    // });

  });//END geocoder.geocode

  // resend verification button was clicked
  } else {
    nev.resendVerificationEmail(email, function(err, userFound) {
      if (err) {
        return res.status(404).send('ERROR: resending verification email FAILED');
      }
      if (userFound) {
        res.json({
          msg: 'An email has been sent to you, yet again. Please check it to verify your account.'
        });
      } else {
        res.json({
          msg: 'Your verification code has expired. Please sign up again.'
        });
      }
    });
  }
}else if(req.body.action === 'invite') {
  //EMAIL VARIFICATION
  nev2nd.configure({
     verificationURL: 'https://80cafa98.ngrok.io/register/invite-verification/${URL}',
     persistentUserModel: User,
     tempUserCollection: 'user_tempinvites',
      // tempUserModel: User_TempInvited,

     transportOptions: {
         service: 'Gmail',
         auth: {
             user: 'modespeaking@gmail.com',
             pass: 'gwtexvqycbstxzvf'
         }
     },
     passwordFieldName: 'password',

     verifyMailOptions: {
         from: 'Do Not Reply <myawesomeemail_do_not_reply@gmail.com>',
         subject: 'Invite to WorkApp',
         html: 'Click the following link to setup your account:</p><p>${URL}</p>',
         text: 'Please setup your account by clicking the following link: ${URL}'
     }
  });
  nev2nd.generateTempUserModel(User_TempInvited, function(err, tempUserModel) {
    console.log('inside nev2nd.generateTempUserModel', tempUserModel);

    if (err) {
      console.log(err);
      return;
    }

    console.log('generated temp user model: ' + (typeof tempUserModel === 'function'));
  });
  if (req.body.action === 'invite') {
    // var password = req.body.password;
    var newUser = new User_TempInvited({
      username: req.body.email,
      email: email,
      password: '123',
      firstname: '',
      lastname: '',
      phone: '',
      address: '',
      role: 'customer',
      clearance: 'user',
      epirts: '',
      company: 'United Bank'//req.user.company
    });
    var agentAddress = '5650 Humboldt Avenue North Minneapolis, MN 55430'
    geocoder.geocode(agentAddress, function ( err, geocodedData ) { //req.body.address
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
        console.log("User inside register.js: ", User);


        console.log('newUserObject: ' , newUserObject);

        nev2nd.createTempUser(newUser, function(err, newTempUser) {
          console.log('inside nev2nd.createTempUser', newUser);
          if (err) {
            return res.status(404).send('ERROR: creating temp user FAILED: ' + err);
          }

          // new user created
          if (newTempUser) {
            console.log('invite newTempUser in register.js', newTempUser);

            var URL = newTempUser[nev2nd.options.URLFieldName];

            nev2nd.sendVerificationEmail(email, URL, function(err, info) {
              if (err) {
                return res.status(404).send('ERROR: sending verification email FAILED: '+ err);
              }
              res.json({
                msg: 'An email has been sent to you. Please check it to verify your account.',
                info: info
              });
            });

          // user already exists in temporary collection!
          } else {
            res.json({
              msg: 'You have already signed up. Please check your email to verify your account.'
            });
          }
        });

    // User.create(newUserObject, function(err, user){
    //     if(err){
    //       next(err);
    //     } else {
    //
    //           //create a stripe account for the user and update user object with token
    //           // createStripeAccount(user, reqbody);
    //       // res.redirect("/");
    //     }
    // });

  });//END geocoder.geocode

  // resend verification button was clicked
  } else {
    nev2nd.resendVerificationEmail(email, function(err, userFound) {
      if (err) {
        return res.status(404).send('ERROR: resending verification email FAILED');
      }
      if (userFound) {
        res.json({
          msg: 'An email has been sent to you, yet again. Please check it to verify your account.'
        });
      } else {
        res.json({
          msg: 'Your verification code has expired. Please sign up again.'
        });
      }
    });
  }
}

});

module.exports = router;
