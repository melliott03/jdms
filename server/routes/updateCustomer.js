var express = require("express");
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var router = express.Router();
var passport = require("passport");
var path = require("path");
var User = require("../models/user");
var geocoder = require('geocoder');
var mongoose = require("mongoose");

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


module.exports = router;
