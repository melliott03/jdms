var express = require("express");
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var router = express.Router();
var passport = require("passport");
var path = require("path");
var User = require("../models/user");
var geocoder = require('geocoder');
var mongoose = require("mongoose");

var moment = require("moment");
var stripe = require("stripe");

var plaid = require('plaid');

var plaidClient = new plaid.Client(process.env.PLAID_CLIENT_ID,
                                   process.env.PLAID_SECRET,
                                   plaid.environments.tartan);



                                              //  // Not recommended: setting global API key state
                                  //  var stripe = require('stripe')(CONNECTED_ACCOUNT_SECRET_KEY);
                                  //  stripe.customers.create({
                                  //    description: "example@stripe.com"
                                  //  });
                                   //
                                              //  // Recommended: sending API key with every request
                                  //  stripe.customers.create(
                                  //    { description: "example@stripe.com" },
                                  //    { api_key: CONNECTED_ACCOUNT_SECRET_KEY } // account's access token from the Connect flow
                                  //  );

var Promise = require('bluebird');
// set Promise provider to bluebird
mongoose.Promise = require('bluebird');
var Work = require('../models/work');
var Work_Tel = require('../models/work_tel');
// var Work_Tel = mongoose.model('Work_Tel');
Promise.promisifyAll(Work_Tel);
Promise.promisifyAll(Work_Tel.prototype);


router.get("/customerGraphData", function(req, res, next){
  console.log('inside post/customerGraphData::::',req.body);

  var promisen = Work.find({customer_id: req.user._id}).exec();
  promisen.then(function(workitems) {
    console.log('workitems | for graph::', workitems);
    return workitems;
  })
  .then(function(workitems) {
    var promise = Work_Tel.find({customer_id: req.user._id}).exec();
    var data = {};
    return promise.then(function(work_tels) {
      console.log('work_tels | before promise return::', work_tels);
      data.work = workitems;
      data.work_tels = work_tels;

      return data;
    })
  })
  .then(function(works) {
    console.log('works tel and onsite before filter and map etc:: ', works);

    works.work_telsGraphs = {};
    works.work_telsGraphs.calls_per_month = {};
    works.work_telsGraphs.calls_cost_per_month = {};
    works.work_telsGraphs.calls_per_month.labels = ["January",	"February",	"March", "April",	"May", "June", "July", "August", "September", "October", "November", "December"];
    works.work_telsGraphs.calls_per_month.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    works.work_telsGraphs.calls_cost_per_month.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    works.workGraphs = {};
    works.workGraphs.appointments_per_month = {};
    works.workGraphs.appointments_costs_per_month = {};
    works.workGraphs.appointments_per_month.labels = ["January",	"February",	"March", "April",	"May", "June", "July", "August", "September", "October", "November", "December"];
    works.workGraphs.appointments_per_month.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    works.workGraphs.appointments_costs_per_month.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    works.combinedGraphs = {};
    works.combinedGraphs.per_month = {};
    works.combinedGraphs.cost_per_month = {};
    works.combinedGraphs.per_month.labels = ["January",	"February",	"March", "April",	"May", "June", "July", "August", "September", "October", "November", "December"];
    works.combinedGraphs.per_month.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    works.combinedGraphs.cost_per_month.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      var workitems = works.work;
      var work_tels = works.work_tels;
      console.log('works at top before map:: ', works);

    return works.work_tels
      .filter(function(obj){
        return (obj.outboundSummary); //returns all objects which has an outboundSummary (if the return statement is true)
      })
      .map(function(obj){
        console.log('in .map work obj:: ', obj);

        if (obj.outboundSummary) { // filter above takes out !obj.outboundSummary cases so this if statement is not really needed
          console.log('obj.outboundSummary is tru for ::', obj);
          obj.date = {};
          obj.date.year = moment.unix(obj.outboundSummary.Timestamp).format("YYYY"); //format("dd, MMM Do YYYY, h:mm:ss a");
          obj.date.month = moment.unix(obj.outboundSummary.Timestamp).format("M"); //format("dd, MMM Do YYYY, h:mm:ss a");
          obj.date.day = moment.unix(obj.outboundSummary.Timestamp).format("Do"); //format("dd, MMM Do YYYY, h:mm:ss a");
          obj.date.weekday = moment.unix(obj.outboundSummary.Timestamp).format("dd"); //format("dd, MMM Do YYYY, h:mm:ss a");
          obj.date.full = moment.unix(obj.outboundSummary.Timestamp).format("dd, MMM Do YYYY"); //format("dd, MMM Do YYYY, h:mm:ss a");
          obj.date.fuller = moment.unix(obj.outboundSummary.Timestamp).format("dd, MMM Do YYYY, h:mm:ss a"); //format("dd, MMM Do YYYY, h:mm:ss a");
            console.log('work obj.created:: ', obj);
        }
      });


  })
  .then(function(works) {
    console.log('works inside then after filter and map applied to work_tels:: ', works);
    //APPLY FILTER TO WORK ONSITE

    res.send(works);
  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
  });

});

router.post("/saveCustomerAddress", function(req, res, next){
  console.log('Geocoding, req.body::::',req.body);
  var address = req.body.address;

      User.findOneAndUpdate({ _id: req.user._id }, { address: address  }, function(err, user) {
        console.log('after saving user"s geo data, user::::',user);
      });
      res.json({address: address})
});

router.post("/saveUserPhoneEmail", function(req, res, next){
  console.log('Saving Phone and Email, req.body::::',req.body);
  var email = req.body.email;
  var phone = req.body.phone;
      User.findOneAndUpdate({ _id: req.user._id }, { email: email, phone: phone  }, function(err, user) {
        console.log('after saving user"s geo data, user::::',user);
        res.json({email: email, phone: phone})
      });
});

router.post("/saveCustomerGeneral", function(req, res, next){
  console.log('In saveCustomerGeneral',req.body);
  var display_name = req.body.display_name;
  console.log('display_name',display_name);
  User.findOneAndUpdate({ _id: req.user._id }, { epirts: {customerID: req.user.epirts.customer.id, customer: req.user.epirts.customer, customer_display_name: display_name } }, function(err, user) {
    if (err) throw err;
    // we have the updated user returned to us
    console.log('after saving user"s stripe info oooo',user);
  });
    res.json({display_name: 'display_name', country: 'country', currency: 'currency'});
});


router.post("/saveUserSSDOBNAME", function(req, res, next){
  console.log('Saving Stripe General, req.body::::',req.body);
  var Connected_stripe_ID = req.user.epirts.id;
  console.log('req.user::::',req.user);
  console.log('req.user.epirts.id::::',req.user.epirts.id);
  console.log('Connected_stripe_ID::::',Connected_stripe_ID);

  var stripe = require("stripe")(
    req.user.epirts.keys.secret
  );

  stripe.accounts.update(Connected_stripe_ID, {
    legal_entity: {
      // additional_owners: 'Michelle Elliott',
      // type: req.body.business_type,
      dob: {
            day:  '24',
            month:  '5',
            year: '1983'
          },
      first_name: 'Michael',
      last_name:  'Elliott',
      ssn_last_4: '2848'
    }
  }).then(function (response) {
      console.log(' stripe response ', response);
      // console.log('token created for card ending in ', response.card.last4);
      User.findOneAndUpdate({ _id: req.user._id }, { epirts: {id: req.user.epirts.id, keys: req.user.epirts.keys, response: response} }, function(err, user) {
        if (err) throw err;
        // we have the updated user returned to us
        console.log('after saving user"s stripe info oooo',user);
      });
    });
    res.json({display_name: 'display_name', country: 'country', currency: 'currency'});
});


router.post("/saveUserPii", function(req, res, next){
  console.log('saveUserPii, req.body::::',req.body);
  console.log('saveUserPii, req.body.id::::',req.body.piiTokenID);

  var Connected_stripe_ID = req.user.epirts.id;
  console.log('req.user::::',req.user);
  console.log('req.user.epirts.id::::',req.user.epirts.id);
  console.log('Connected_stripe_ID::::',Connected_stripe_ID);

  var stripe = require("stripe")(
    req.user.epirts.keys.secret
  );

  stripe.accounts.update(Connected_stripe_ID, {
    legal_entity: {
      personal_id_number: req.body.piiTokenID
    }
  }).then(function (response) {
      console.log(' stripe personal_id_number response:::: ', response);
      // console.log('token created for card ending in ', response.card.last4);
      User.findOneAndUpdate({ _id: req.user._id }, { epirts: {id: req.user.epirts.id, keys: req.user.epirts.keys, response: response} }, function(err, user) {
        if (err) throw err;
        // we have the updated user returned to us
        console.log('after saving user"s stripe info oooo',user);
      });
    });
    res.json({display_name: 'display_name', country: 'country', currency: 'currency'});
});


router.post("/saveUserPlaidToken", function(req, res, next){
  console.log('saveUserPlaidToken, req.body::::',req.body);
  console.log('saveUserPlaidToken, req.body::::',req.body.token);
  // console.log('saveUserPii, req.body.id::::',req.body.token.id);

  var public_token = req.body.token;
  var account_id = req.body.account_id;

  // Exchange a public_token and account_id for a Plaid access_token
  // and a Stripe bank account token
  plaidClient.exchangeToken(public_token, account_id, function(err, res) {
    if (err != null) {
      // Handle error!
    } else {
      // This is your Plaid access token - store somewhere persistent
      // The access_token can be used to make Plaid API calls to
      // retrieve accounts and transactions
      var access_token = res.access_token;
      console.log('access_token::', access_token);

      // This is your Stripe bank account token - store somewhere
      // persistent. The token can be used to move money via
      // Stripe's ACH API.
      var bank_account_token = res.stripe_bank_account_token;

      console.log('bank_account_token::', bank_account_token);
      //tell stripe to create a customer object on the stripe account id that is req.user.epirts.id
      //save the stripe_bank_account_token to the newly created customer object
      stripe.customers.create({
        description: 'Customer for test@example.com',
        source:  bank_account_token, // obtained with plaid
        email: req.user.email
      }, function(err, customer) {
        console.log('customer::',customer);
        // asynchronously called
        User.findOneAndUpdate({ _id: req.user._id }, { epirts: {customerID: customer.id} }, function(err, user) {
          if (err) throw err;

          // we have the updated user returned to us
          console.log('after saving user oooo',user);
        });
      });
    }
  });

  var Connected_stripe_ID = req.user.epirts.id;
  console.log('req.user::::',req.user);
  console.log('req.user.epirts.id::::',req.user.epirts.id);
  console.log('Connected_stripe_ID::::',Connected_stripe_ID);

  var stripe = require("stripe")(
    req.user.epirts.keys.secret
  );

  stripe.accounts.createExternalAccount(
  Connected_stripe_ID,
  {external_account: public_token},
  function(err, bank_account) {
    // asynchronously called
    console.log('bank_account::', bank_account);
  }
).then(function (response) {
      console.log(' stripe plaidPublic_token response:::: ', response);
      // console.log('token created for card ending in ', response.card.last4);
      User.findOneAndUpdate({ _id: req.user._id }, { epirts: {id: req.user.epirts.id, keys: req.user.epirts.keys, response: req.user.epirts.response, account: req.user.epirts.account} }, function(err, user) {
        if (err) throw err;
        // we have the updated user returned to us
        console.log('after saving user"s stripe info oooo',user);
      });
    });
    res.json({display_name: 'display_name', country: 'country', currency: 'currency'});
});


router.post('/stripecc', passport.authenticate('jwt', { session: false }), function(req, res) {
  console.log('req.user:', req.user);
  // console.log('req.body:', req.body);
  console.log('req.body:', req.body);
  console.log('source: req.body.id::', req.body.token);

  var stripe = require("stripe")(
  "sk_test_SfT5Rf2DMVfT0unJf7aIIskQ"
);

  stripe.customers.createSource(req.user.epirts.customerID, {
    source: req.body.token
  }, function(err, card) {
    console.log('customer after update::', card);
    // asynchronously called
    if (err) {
      console.log(' stripe err::', err);
      console.error('console.error::', err);
    }
    console.log(' stripe customer ', card);

    stripe.customers.retrieve(
      req.user.epirts.customerID,
      function(err, customer) {
        // asynchronously called
        User.findOneAndUpdate({ _id: req.user._id }, { epirts: {customerID: req.user.epirts.customerID, customer: customer} }, function(err, user) {
          if (err) throw err;
          // we have the updated user returned to us
          console.log('after saving user"s stripe info oooo',user);
        });
      }
    );


  }).then(function (response) {
      console.log(' stripe card add to customer response:::: ', response);
      // console.log('token created for card ending in ', response.card.last4);
      // User.findOneAndUpdate({ _id: req.user._id }, { epirts: {id: req.user.epirts.id, keys: req.user.epirts.keys, response: req.user.epirts.response, account: req.user.epirts.account} }, function(err, user) {
      //   if (err) throw err;
      //   // we have the updated user returned to us
      //   console.log('after saving user"s stripe info oooo',user);
      // });
    });

  // stripe.accounts.createSource(Connected_stripe_ID,
  //   //"cus_8aZsCveeEh7TX8",
  //   {source: req.body.token/*"tok_18GtiTDfqZ6t9CGDQUYAYBpH"*/},
  //   function(err, card) {
  //     if (err) {
  //       console.log('err::', err);
  //     }
  //     console.log('card::', card);
  //     // asynchronously called
  //   }
  // );


  // stripe.customers.createSource(req.user.epirts.customerID,
  //   //"cus_8aZsCveeEh7TX8",
  //   {source: req.body.token/*"tok_18GtiTDfqZ6t9CGDQUYAYBpH"*/},
  //   function(err, card) {
  //     console.log('card::', card);
  //     // asynchronously called
  //   }
  // );

  // Work.find({$or : [{'customer_id': req.user._id}, {'contractor_id': req.user._id}]}, function(err, messages) {
  //   if (err)
  //     res.send(err);
  //
  //   res.json(messages);
  // });
  res.json({message: "hi from server"});

});


router.post("/saveCustomerPlaidToken", function(req, res, next){
  console.log('/saveCustomerPlaidToken wakawaka, req.body::::',req.body);
  console.log('/saveCustomerPlaidToken, req.body.public_token::::',req.body.public_token);
  // console.log('saveUserPii, req.body.id::::',req.body.public_token.id);

  var public_token = req.body.public_token;
  var account_id = req.body.account_id;

  // Exchange a public_token and account_id for a Plaid access_token
  // and a Stripe bank account token
  plaidClient.exchangeToken(public_token, account_id, function(err, res) {
    if (err != null) {
      // Handle error!
    } else {
      // This is your Plaid access token - store somewhere persistent
      // The access_token can be used to make Plaid API calls to
      // retrieve accounts and transactions
      var access_token = res.access_token;
      console.log('access_token::', access_token);

      // This is your Stripe bank account token - store somewhere
      // persistent. The token can be used to move money via
      // Stripe's ACH API.
      var bank_account_token = res.stripe_bank_account_token;

      console.log('bank_account_token::', bank_account_token);
      //tell stripe to create a customer object on the stripe account id that is req.user.epirts.id
      //save the stripe_bank_account_token to the newly created customer object
      var stripe = require("stripe")(
      "sk_test_SfT5Rf2DMVfT0unJf7aIIskQ"
    );

      stripe.customers.createSource(req.user.epirts.customerID, {
        source: bank_account_token
      }, function(err, card) {
        console.log('customer after update::', card);
        // asynchronously called
        if (err) {
          console.log(' stripe err::', err);
          console.error('console.error::', err);
        }
        console.log(' stripe customer ', card);

        stripe.customers.retrieve(
          req.user.epirts.customerID,
          function(err, customer) {
            // asynchronously called
            User.findOneAndUpdate({ _id: req.user._id }, { epirts: {customerID: req.user.epirts.customerID, customer: customer} }, function(err, user) {
              if (err) throw err;
              // we have the updated user returned to us
              console.log('after saving user"s stripe info oooo',user);
            });
          }
        );
      }).then(function (response) {
          console.log(' stripe card add to customer response:::: ', response);
        });
    }
  });
    res.json({display_name: 'display_name', country: 'country', currency: 'currency'});
});

router.post("/saveCustCheck", function(req, res, next){
  console.log('/saveCustomerPlaidToken wowowo, req.body::::',req.body);
  // console.log('/saveCustomerPlaidToken, req.body.public_token::::',req.body.public_token);
  // console.log('saveUserPii, req.body.id::::',req.body.public_token.id);

  // var public_token = req.body.public_token;
  var token = req.body.token;

      var stripe = require("stripe")(
      "sk_test_SfT5Rf2DMVfT0unJf7aIIskQ"
    );

      stripe.customers.createSource(req.user.epirts.customerID, {
        source: token
      }, function(err, check) {
        console.log('customer after update::', check);
        // asynchronously called
        if (err) {
          console.log(' stripe err::', err);
          console.error('console.error::', err);
        }
        console.log(' stripe customer ', check);

        stripe.customers.retrieve(
          req.user.epirts.customerID,
          function(err, customer) {
            // asynchronously called
            User.findOneAndUpdate({ _id: req.user._id }, { epirts: {customerID: req.user.epirts.customerID, customer: customer} }, function(err, user) {
              if (err) throw err;
              // we have the updated user returned to us
              console.log('after saving user"s stripe info oooo',user);
            });
          }
        );
      }).then(function (response) {
          console.log(' stripe check add to customer response:::: ', response);
        });

    res.json({display_name: 'display_name', country: 'country', currency: 'currency'});
});

router.post('/saveUserIdentityDocument', passport.authenticate('jwt', { session: false }), multipartyMiddleware, function(req, res) {
  console.log('inside updateUser/saveUserIdentityDocument::');

      //https://github.com/danialfarid/ng-file-upload/wiki/Node-example

      // We are able to access req.files.file thanks to
      // the multiparty middleware
      var file = req.files.file;
      console.log('file.name',file.name);
      console.log('file.type', file.type);
      console.log('file', file);

      console.log('saveUserIdentityDocument, req.body::::',req.body);

      var Connected_stripe_ID = req.user.epirts.id;
      console.log('req.user::::',req.user);
      console.log('req.user.epirts.id::::',req.user.epirts.id);
      console.log('Connected_stripe_ID::::',Connected_stripe_ID);

      const fs = require('fs');
      var fp = fs.readFileSync(file.path);
      var stripe = require('stripe')('sk_test_SfT5Rf2DMVfT0unJf7aIIskQ'); // 'sk_test_SfT5Rf2DMVfT0unJf7aIIskQ', 'pk_test_C6pNjUH41hCQ87RXmeLBIAa5', PLATFORM_SECRET_KEY
      stripe.fileUploads.create(
        {
          purpose: 'identity_document',
          file: {
            data: fp, //fs.readFileSync('/path/to/a/file.jpg'),
            name: 'drivers_license.jpg',
            type: 'application/octet-stream'
          }
        },
        {stripe_account: Connected_stripe_ID}
      ).then(function (response) {
          console.log(' stripe identity_document response:::: ', response);
          // console.log('token created for card ending in ', response.card.last4);

        stripe.accounts.retrieve(
          Connected_stripe_ID,
          function(err, account) {
            // asynchronously called
            User.findOneAndUpdate({ _id: req.user._id }, { epirts: {id: req.user.epirts.id, keys: req.user.epirts.keys, response: req.user.epirts.keys, account: account} }, function(err, user) {
              if (err) throw err;
              // we have the updated user returned to us
              console.log('after saving user"s stripe info oooo',user);
            });
          }
        );

        });
        res.json({file_name: file.name, file_type: file.type});


});



router.get('/customerMoneyBalance', passport.authenticate('jwt', { session: false }), function(req, res) {
  console.log('inside updateUser/customerMoneyBalance::');
  var stripe = require("stripe")('sk_test_SfT5Rf2DMVfT0unJf7aIIskQ');

  var customer = req.user;
  var customer_id = customer.epirts.customer.id;
  var data = {};

  //GET CUSTOMER'S BALANCE
  stripe.customers.retrieve(customer_id)
  .then(function(customer){
    var balance = customer.account_balance;
      if (customer){
        data.stripeCustomer = customer;
        data.balance = balance;
        data.customer_id = customer_id;
        return data;
      }
  }).then(function(data){
    return stripe.invoices.retrieveUpcoming(data.customer_id).then(function(upcoming){
      data.upcomingInvoice = upcoming;
      return data;
    })

/*
    stripe.invoices.list(data.customer_id).then(function(invoices){
      data.invoices = invoices ;
      return data;
    })


      stripe.invoices.list(
        { limit: 3 },
        function(err, invoices) {
          // asynchronously called
        }
      );
    */

  }).catch(function(error){
    console.log('catch error top :', error);

    if (error.message.includes("No upcoming invoices for customer") ) {
        console.log('catch error.message.includes("No upcoming invoices for customer error.message::")  :', error.message);
      // res.status(404).send({ error: "No upcoming invoices for customer "});
      return data;
    } else{
      console.log('catch error:', error);
      res.status(500).send({ error: "some error"});
    }
    // just need one of these
  }).then(function(data){
    var upcomingInvoicetotal;
    if (data.upcomingInvoice) {
      upcomingInvoicetotal = data.upcomingInvoice.total;
    } else {
      upcomingInvoicetotal = 0;
    }
    var newdata = {};
    money_available = data.stripeCustomer.account_balance + upcomingInvoicetotal;
    money_available = money_available*-1;
    money_available = money_available/100;
    newdata.available_balance = money_available;
    console.log('newdata::', newdata);
    res.send(newdata);

  }).catch(function(error){
    console.log('catch error top :', error);

    if (error.message.includes("No upcoming invoices for customer") ) {
      console.log('catch error.message.includes("No upcoming invoices for customer error.message::")  :', error.message);
      // res.status(404).send({ error: "No upcoming invoices for customer "});

    } else if (2 > 6) {

    } else{
      console.log('catch error:', error);
      res.status(500).send({ error: "some error"});

    }
    // just need one of these
  });

});



router.get('/customerMoneyCharges', passport.authenticate('jwt', { session: false }), function(req, res) {
  console.log('inside updateUser/customerMoneyCharges::', req.user);
  var stripe = require("stripe")('sk_test_SfT5Rf2DMVfT0unJf7aIIskQ');

  var customer = req.user;
  var customer_id = customer.epirts.customer.id;
  var data = {};

  //GET CUSTOMER'S CHARGES
  stripe.charges.list({customer: customer_id})
  .then(function(charges){
      if (charges){
        console.log('charges at top before map:: ', charges);
        charges.data.map(function(obj){
          obj.createdDateReadable = moment.unix(obj.created).format("MMM. Do, YYYY"); //format("dd, MMM Do YYYY, h:mm:ss a");
            console.log('obj.created:: ', obj.created);
            console.log('obj.createdDateReadable:: ', obj.createdDateReadable);

        });
        res.send(charges);
      }
  }).catch(function(error){
    console.log('catch error top stripe.charges.list:', error);

    if (error.message.includes("No upcoming invoices for customer") ) {
      console.log('catch stripe.charges.list("No upcoming invoices for customer error.message::")  :', error.message);
      // res.status(404).send({ error: "No upcoming invoices for customer "});

    } else if (2 > 6) {

    } else{
      console.log('catch error stripe.charges.list:', error);
      res.status(500).send({ error: "some error"});

    }
    // just need one of these
  });

});

router.get('/customerInvoices', passport.authenticate('jwt', { session: false }), function(req, res) {
  console.log('inside updateUser/customerInvoices::');
  var stripe = require("stripe")('sk_test_SfT5Rf2DMVfT0unJf7aIIskQ');

  var customer = req.user;
  var customer_id = customer.epirts.customer.id;
  var data = {};

  //GET CUSTOMER'S CHARGES
  stripe.invoices.list({customer: customer_id})
  .then(function(invoices){
      if (invoices){
        console.log('invoices at top before map:: ', invoices);
        // invoices.data.map(function(obj){
        //   obj.createdDateReadable = moment.unix(obj.created).format("MMM. Do, YYYY"); //format("dd, MMM Do YYYY, h:mm:ss a");
        //     console.log('obj.created:: ', obj.created);
        //     console.log('obj.createdDateReadable:: ', obj.createdDateReadable);
        //
        // });
        res.send(invoices);
      }
  }).catch(function(error){
    console.log('catch error top stripe.charges.list:', error);

    if (error.message.includes("No upcoming invoices for customer") ) {
      console.log('catch stripe.charges.list("No upcoming invoices for customer error.message::")  :', error.message);
      // res.status(404).send({ error: "No upcoming invoices for customer "});

    } else if (2 > 6) {

    } else{
      console.log('catch error stripe.charges.list:', error);
      res.status(500).send({ error: "some error"});

    }
    // just need one of these
  });

});



module.exports = router;
