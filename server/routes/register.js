var express = require("express");
var router = express.Router();
var passport = require("passport");
var path = require("path");
var User = require("../models/user");
var User_TempInvited = require("../models/user_invited");
var geocoder = require('geocoder');
// var createStripeAccount = require("../modules/createStripeAccount");
var stripe = require("stripe")('sk_test_SfT5Rf2DMVfT0unJf7aIIskQ');
var mongoose = require("mongoose");
var nev = require('email-verification')(mongoose);
var nev2nd = require('email-verification')(mongoose);

var createStripeCustomer = function(user, req){
  stripe.customers.create({
    description: 'Customer for work app',
    // source:  bank_account_token, // obtained with plaid
    email: user.email
  }, function(err, customer) {
    console.log('customer::',customer);
    // asynchronously called
    User.findOneAndUpdate({ _id: user._id }, { epirts: {customerID: customer.id, customer: customer} }, function(err, user) {
      if (err) throw err;

      // we have the updated user returned to us
      console.log("after creating and saving the user's stripe customer info", user);
    });
  });
}

var createStripeAccount = function(user, req){

        console.log('req.body', req.body);
        console.log('INSIDE stripe/create on server req.body._id:', req.body);
        console.log('user._id', user._id);
        console.log('user', user);
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
          if (err) {console.log('stripe err::',err);}
          console.log('account:::', account);
          User.findOneAndUpdate({ _id: user._id }, { epirts: {accountID: account.id, keys: account.keys, account: account} }, function(err, user) {
            if (err) throw err;

            // we have the updated user returned to us
            console.log('after saving user"s stripe info oooo',user);
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

//EMAIL VARIFICATION
nev.configure({
   verificationURL: process.env.APPURL+'/register/email-verification/${URL}',
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

      //create stripe account object for contractor or customer object customer
      if (user.role == 'customer') {
        createStripeCustomer(user, req);
      } else if (user.role == 'contractor') {
        createStripeAccount(user, req);
      }

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
  console.log("Im in signup req.body:", req.body);
  if (req.body.action === 'signup') {
    // geocoder.geocode(req.body.address, function ( err, geocodedData ) { //req.body.address
    //   console.log('1st geocodedData',geocodedData);
    // });//END geocoder.geocode
    var password = req.body.password;
  //   var geo = req.body.geo;
  //       // geo = geo.slice(1, -1);
  //       geo = geo.substring(1, geo.length-2);
  //       // geo = geo.replace(/^"+/i, '');
  //       geo = geo.replace(/[\'\"]+/g, '');
  //       geo = "{" + geo + "}";
  // console.log("Im in signup :", geo);
  // console.log("Im in signup geo.lat:", geo.lat);
    var newUser;
    // geocoder.geocode(req.body.address, function ( err, geocodedData ) { //req.body.address
    //   console.log('2nd geocodedData',geocodedData);
    //
    //   var newUserObject = {};
    //   var geocodedData = geocodedData.results[0].geometry.location;
      var geo = [];
          geo[0]=0;
          geo[1]=0;
    //
    //     newUserObject.geo = geo;
    //     newUserObject.username = req.body.username;
    //     newUserObject.password = req.body.password;
    //     newUserObject.firstname = req.body.firstname;
    //     newUserObject.lastname = req.body.lastname;
    //     newUserObject.phone = req.body.phone;
    //     newUserObject.email = req.body.email;
    //     newUserObject.address = req.body.address;
    //     newUserObject.role = req.body.role;
    //     newUserObject.type = req.body.type;
    //     newUserObject.epirts;
    //
    //     var reqbody =req.body;

        newUser = new User({
          username: req.body.username,
          email: email,
          password: password,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          phone: req.body.phone,
          privilege_role: req.body.privilege_role || '',
          address: req.body.address || '',
          role: req.body.role,
          type: req.body.type,
          epirts: '',
          geo: geo || ''
        });
        // console.log("newUserObject.geo : ", newUserObject.geo);


        // console.log("newUserObject : ", newUserObject);
        // console.log("User inside register.js: ", User);


        // console.log('newUserObject: ' , newUserObject);

        nev.createTempUser(newUser, function(err, newTempUser) {
          console.log('inside nev.createTempUser newUser::', newUser);
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


  // });//END geocoder.geocode

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
     verificationURL: process.env.APPURL+'/register/invite-verification/${URL}',
     persistentUserModel: User,
     tempUserCollection: 'user_tempinvites',
      tempUserModel: User_TempInvited,

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
      privilege_role: req.body.privilege_role,

      address: '',
      role: 'customer',
      clearance: 'user',
      epirts: '',
      company: 'United Bank'//req.user.company
    });
    var agentAddress = req.body.address;
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
