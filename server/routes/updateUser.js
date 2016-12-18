var express = require("express");
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var configsty = require('config-node');

var router = express.Router();
var passport = require("passport");
var path = require("path");
var User = require("../models/user");
var geocoder = require('geocoder');
var mongoose = require("mongoose");
// var stripe = require("stripe")("sk_test_SfT5Rf2DMVfT0unJf7aIIskQ");
// var stripe = require("stripe")('pk_test_C6pNjUH41hCQ87RXmeLBIAa5');
// var stripe = require("stripe")('sk_test_SfT5Rf2DMVfT0unJf7aIIskQ');
var twilio = require('twilio');

var plaid = require('plaid');

var plaidClient = new plaid.Client(configsty.PLAID_CLIENT_ID,
                                   configsty.PLAID_SECRET,
                                   plaid.environments.tartan);


router.post("/saveUserAddress", function(req, res, next){
  console.log('Geocoding, req.body::::',req.body);
  var address = req.body.address;
  geocoder.geocode(address, function ( err, geocodedData ) { //req.body.address
    if (err) throw err;

    console.log('After Geocoding, geocodedData::::',geocodedData);

    var Connected_stripe_ID = req.user.epirts.id;
    var stripe = require("stripe")(
      req.user.epirts.keys.secret
    );

    stripe.accounts.update(Connected_stripe_ID, {
      legal_entity: {
        address: {
              city:  'Minneapolis',
              line1:  '5650 Humboldt Ave N',
              postal_code: '55430',
              state: 'MN'
            }
      }
    }).then(function (response) {
        console.log(' stripe response ', response);
        // console.log('token created for card ending in ', response.card.last4);
        User.findOneAndUpdate({ _id: req.user._id }, { epirts: {id: req.user.epirts.id, keys: req.user.epirts.keys, response: response} }, function(err, user) {
          if (err) throw err;
          // we have the updated user returned to us
          console.log('after saving user"s stripe info 3241',user);
        });
      });
    var geocodedData = geocodedData.results[0].geometry.location;
    var geo = [];
        geo[0]=geocodedData.lat;
        geo[1]=geocodedData.lng;
      // User.findOneAndUpdate({ _id: req.user._id }, { geo: {customerID: customer.id} }, function(err, user) {
      User.findOneAndUpdate({ _id: req.user._id }, { geo: geo, address: address  }, function(err, user) {
        console.log('after saving user"s geo data, user::::',user);
      });
      res.json({geocodedData: geocodedData, address: address})
  });//END geocoder.geocode
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

router.post("/saveUserGeneral", function(req, res, next){
  console.log('Saving Stripe General, req.body::::',req.body);

  if (req.user.role == "customer") {

  } else if (req.user.role == "contractor") {
    var Connected_stripe_ID = req.user.epirts.id;
    console.log('req.user::::',req.user);
    console.log('req.user.epirts.id::::',req.user.epirts.id);
    console.log('Connected_stripe_ID::::',Connected_stripe_ID);
    console.log('req.body.business_type::::',req.body.business_type);

      var display_name = req.user.display_name,
      country = req.body.country,
      currency = req.body.currency;

    var stripe = require("stripe")(
      req.user.epirts.keys.secret
    );

    stripe.accounts.update(Connected_stripe_ID, {
      support_phone: "555-867-9999",
      legal_entity: {
        // additional_owners: 'Michelle Elliott',
        // type: req.body.business_type,
        type: 'company'
      }
    }).then(function (response) {
        console.log(' stripe response ', response);
        // console.log('token created for card ending in ', response.card.last4);
        User.findOneAndUpdate({ _id: req.user._id }, { epirts: {id: req.user.epirts.id, keys: req.user.epirts.keys, response: response} }, function(err, user) {
          if (err) throw err;
          // we have the updated user returned to us
          console.log('after saving user"s stripe info 2231',user);
        });
      });
  } //end of if(req.user.role == "contractor")

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
        console.log('after stripe saveUserSSDOBNAME, user::',user);
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
        console.log('after saving user"s stripe info 1231::',user);
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
        console.log('after saving user"s stripe info 5323',user);
      });
    });
    res.json({display_name: 'display_name', country: 'country', currency: 'currency'});
});


router.post('/stripecc', passport.authenticate('jwt', { session: false }), function(req, res) {
  console.log('req.user:', req.user);
  // console.log('req.body:', req.body);
  console.log('req.body:', req.body);
  console.log('source: req.body.id::', req.body.token);
  var Connected_stripe_ID = req.user.epirts.id;

  var stripe = require("stripe")(
    req.user.epirts.keys.secret
  );

  stripe.accounts.createExternalAccount(
  Connected_stripe_ID,
  {external_account: req.body.token},
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
        console.log('after saving user"s stripe info 3521::',user);
      });
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
        console.log('after saving user"s stripe info 3234',user);
      });
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
              console.log('after saving user"s stripe info 6342',user);
            });
          }
        );

        });
        res.json({file_name: file.name, file_type: file.type});


});


router.post('/switch/tel', twilio.webhook({validate: false}), function (req, res) {
  console.log('inside /switch/tel req.body::', req.body);
  var accountSid = configsty.TWILIO_ACCOUNT_SID;
  var authToken = configsty.TWILIO_AUTH_TOKEN;
  var workspaceSid = configsty.TWILIO_WORKSPACE_SID;
  var post_work_activity_sid = '';
  if (req.body.TelStatus == true) {
    post_work_activity_sid = 'WAbaf024ac1c7fc5d4b9f138173ac3ca12';
  } else if (req.body.TelStatus == false) {
    post_work_activity_sid = 'WA158de9d717dfb9577acbb6f5de403291';
  }


  //Find workerSid in DB
  var promise = User.findById(req.user._id).exec();
  promise.then(function(contractor) {
    console.log('contractor | ::', contractor);
    return contractor;
  })
  .then(function(contractor) {
    // do something with
    var workerSid = contractor.twilioSids.workerSid;

    var client = new twilio.TaskRouterClient(accountSid, authToken, workspaceSid);

    client.workspace.workers(workerSid).update({
        // attributes: '{"type":"support"}'
        activitySid: post_work_activity_sid
    }, function(err, worker) {
      if (err) {
        console.log('err updating post_work_activity_sid::', err);
      }else if (worker) {
        contractor.switchs.tel = true;
        contractor.save();
        console.log('worker after updating post_work_activity_sid from switch::', worker);
      }
    });

  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
  });

});

router.post("/switch", function(req, res, next){
  console.log('/switch, req.body::::',req.body);

  console.log('req.user::::',req.user);
  //if req.body.
  if (req.body.OnsiteStatus == true || req.body.OnsiteStatus == false) {
    //find the contractor and update their status
  } else if (req.body.TelStatus == true || req.body.TelStatus == false) {
    // update the user status with twilio

    // then find the contractor and update their status

  }
    res.json({display_name: 'display_name', country: 'country', currency: 'currency'});
});




module.exports = router;
