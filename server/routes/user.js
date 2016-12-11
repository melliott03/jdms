var express = require("express");
var router = express.Router();
var User = require("../models/user");
var stripe = require("stripe")('sk_test_SfT5Rf2DMVfT0unJf7aIIskQ');

// var sugar = require('sugar');

// router.get("/", function(req,res,next){
//     res.json(req.isAuthenticated());
// });

router.get("/name", function(req,res,next){
  console.log("IS USER AUTHENTICATED?", req.isAuthenticated());
  // var reminderDateTime =  req.user.lastlogin;
  //     console.log('Date.create(reminderDateTime):' ,Date.create(reminderDateTime));
  //     console.log('(8).hoursBefore(reminderDateTime):' ,(2).hoursBefore(reminderDateTime));
  //     reminderDateTime = (2).hoursBefore(reminderDateTime);
  // var milliseconds = reminderDateTime.getTime();
  //     console.log(' (2).hoursBefore(reminderDateTime) in milliseconds:' , milliseconds);

  // reminderDateTime = reminderDateTime.setHours(reminderDateTime.getHours() - 12);



  var resUser = {};
  if (req.user.role == 'customer') {
    //UPDATE USER SOURCES IF null
    // if (!req.user.epirts.customer) {
      stripe.customers.retrieve(
        req.user.epirts.customerID,
        function(err, customer) {
          // asynchronously called
          User.findOneAndUpdate({ _id: req.user._id }, { epirts: {customerID: req.user.epirts.customerID, customer: customer, customer_display_name: req.user.epirts.customer_display_name} }, function(err, user) {
            if (err) throw err;
            // we have the updated user returned to us
            console.log('after saving user"s stripe info oooo',user);
          });
        }
      );
    // } else {
      //loop over payment sources take only :
      // exp_month
      // exp_year
      // last4
      // object
      var paymentSourcesNewArray = [];
      var paymentSourcesArray = req.user.epirts.customer.sources.data;
      for (var i = 0; i < paymentSourcesArray.length; i++) {
        var last4 = paymentSourcesArray[i].last4,
        object = paymentSourcesArray[i].object,
        exp_month = paymentSourcesArray[i].exp_month,
        exp_year = paymentSourcesArray[i].exp_year,
        id = paymentSourcesArray[i].id;

        if (paymentSourcesArray[i].status) {
          var status = paymentSourcesArray[i].status;
        }

        var paymentSourceObject = {
          last4: last4,
          object: object,
          exp_month: exp_month,
          exp_year: exp_year,
          id: id,
          status: status
        };
        paymentSourcesNewArray.push(paymentSourceObject);
      };
      console.log('paymentSourcesNewArray', paymentSourcesNewArray);

      resUser = {
        username: req.user.username,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        datecreated: req.user.lastlogin,
        phone: req.user.phone,
        address: req.user.address,
        type: req.user.type,
        email: req.user.email,
        geo: req.user.geo,
        role: req.user.role,
        id: req.user._id,
        display_name: req.user.epirts.customer_display_name,
        telephonicID: req.user.telephonicID,
        telephonicPassCode: req.user.telephonicPassCode,
        autoRecharge: req.user.autoRecharge,
        sources: {
          total_count: req.user.epirts.customer.sources.total_count,
          data: paymentSourcesNewArray,
          default_source: req.user.epirts.customer.default_source
        }
        // reminderDateTime: reminderDateTime
      }
    // }
  } else if (req.user.role == 'contractor') {
    //UPDATE USER SOURCES IF null
    if (!req.user.epirts.account) {
      stripe.accounts.retrieve(
        req.user.epirts.accountID,
        function(err, customer) {
          // asynchronously called
          User.findOneAndUpdate({ _id: req.user._id }, { epirts: {accountID: req.user.epirts.accountID, account: account} }, function(err, user) {
            if (err) throw err;
            // we have the updated user returned to us
            console.log('after saving user"s stripe info oooo',user);
          });
        }
      );
    } else {

      //loop over payment sources take only :
      // exp_month
      // exp_year
      // last4
      // object
      var paymentSourcesNewArray = [];
      if (req.user.epirts.account.external_accounts.data.length > 0) {
        var paymentSourcesArray = req.user.epirts.account.external_accounts.data;
        for (var i = 0; i < paymentSourcesArray.length; i++) {
          var last4 = paymentSourcesArray[i].last4,
          object = paymentSourcesArray[i].object,
          exp_month = paymentSourcesArray[i].exp_month,
          exp_year = paymentSourcesArray[i].exp_year;

          var paymentSourceObject = {
            last4: last4,
            object: object,
            exp_month: exp_month,
            exp_year: exp_year
          };
          paymentSourcesNewArray.push(paymentSourceObject);
        };
        console.log('paymentSourcesNewArray', paymentSourcesNewArray);
      }

      resUser = {
        username: req.user.username,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        datecreated: req.user.lastlogin,
        phone: req.user.phone,
        address: req.user.address,
        type: req.user.type,
        email: req.user.email,
        geo: req.user.geo,
        role: req.user.role,
        id: req.user._id,
        languages: req.user.languages,
        // display_name: req.user.epirts.customer_display_name,
        sources: {
          total_count: req.user.epirts.account.external_accounts.total_count,
          data: paymentSourcesNewArray
        },
        switchs: req.user.switchs
        // reminderDateTime: reminderDateTime
      }
    }
  } else if (req.user.role == 'admin') {
    //UPDATE USER SOURCES IF null

      //loop over payment sources take only :
      // exp_month
      // exp_year
      // last4
      // object

      resUser = {
        username: req.user.username,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        datecreated: req.user.lastlogin,
        phone: req.user.phone,
        address: req.user.address,
        type: req.user.type,
        email: req.user.email,
        geo: req.user.geo,
        role: req.user.role,
        id: req.user._id
        // reminderDateTime: reminderDateTime
      }

  }
  res.json(resUser);
});

module.exports = router;
