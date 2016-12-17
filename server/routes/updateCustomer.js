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

var moment = require("moment");
var stripe = require("stripe")('sk_test_SfT5Rf2DMVfT0unJf7aIIskQ');

var plaid = require('plaid');

var plaidClient = new plaid.Client(configsty.PLAID_CLIENT_ID,
  configsty.PLAID_SECRET,
  plaid.environments.tartan);

  var zipcode_to_timezone = require( 'zipcode-to-timezone' );



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


  router.post("/customerGraphData", function(req, res, next){
    console.log('inside post/customerGraphData::::',req.body);
    console.log('inside post/customerGraphData::::',req.body.myStartDate);
    console.log('inside post/customerGraphData::::',req.body.myEndDate);
    var StartDate = req.body.myStartDate;
    var EndDate = req.body.myEndDate;

    // var startDate = moment().startOf('day')
    // var endDate = moment(startDate).subtract(100, 'days')
    // console.log('startDate Work::', startDate);
    // console.log('endDate Work::', endDate);
    // var start = req.body.startDate;
    // var end = req.body.endDate;

    var promisen = Work.find({
      customer_id: req.user._id
      // ,
      // createdAt: {
      //  $gte: startDate.toDate(),
      //  $lt: endDate.toDate()
      // }
    }).exec();
    promisen.then(function(workitems) {
      console.log('workitems | for graph::', workitems);
      console.log('workitems.length | for graph::', workitems.length);
      return workitems;
    })
    .then(function(workitems) {
      var startDate = req.body.myStartDate;
      var endDate = req.body.myEndDate;

      console.log('startDate Work_Tel before ISODate::', startDate);
      console.log('endDate Work_Tel before ISODate::', endDate);
      // startDate = ISODate(startDate);
      // endDate = ISODate(endDate);
      // console.log('startDate Work_Tel after ISODate::', startDate);
      // console.log('endDate Work_Tel after ISODate::', endDate);
      console.log("new Date('2016-01-22T14:56:59.301Z')::", new Date("2016-01-22T14:56:59.301Z").toISOString());
      var promise = Work_Tel.find({
        customer_id: req.user._id
        ,
        'outboundSummary.createdAt':
        /*{"$gte": new Date(2016, 1, 14),
        "$lt": new Date(2016, 12, 15)} // works
        {"$gte": new Date(2016-01-01),
        "$lt": new Date(2016-12-31)} // does not work

        {"$gte": new Date('2016-01-22T14:56:59.301Z'),
        "$lt": new Date('2016-12-22T14:56:59.301Z')} // works
        */

        // {"$gte": new Date('2016-01-01T00:00:00Z'),
        // "$lte": new Date('2016-12-31T23:00:00Z')} // works

        {"$gte": new Date(startDate),
        "$lte": new Date(endDate)} // works


      }).exec();
      var data = {};
      return promise.then(function(work_tels) {
        console.log('work_tels | before promise return::', work_tels);
        console.log('work_tels.length | before promise return::', work_tels.length);

        data.work = workitems;
        data.work_tels = work_tels;

        return data;
      })
    })
    .then(function(works) {
      console.log('works tel and onsite before filter and map etc:: ', works);
      console.log('works.work_tels tel and onsite before filter and map etc:: ', works.work_tels);
      var visualData = {};
      var work_telsLanguageList = [];
      var work_tels = works.work_tels;

      work_tels.map(function(obj){
        if (obj.language) {
          work_telsLanguageList.push(obj.language);
        }
      });

      var doughnut_label = [...new Set(work_telsLanguageList)]; //returns a  list of unique languages array
      var doughnut_data = [];
      var arrayOfObjDates = [];

      // var  = work_telsUniqueLanguageList; //["Download Sales", "In-Store Sales", "Mail-Order Sales"];

      // create doughnut_data Array to have same number of indexes as doughnut_label Array
      doughnut_label.forEach(function(element) {
        doughnut_data.push(0);
      });
      console.log('after pushing a 0 to mach the # of indexes in label array doughnut_data::', doughnut_data);

      work_tels.map(function(obj){
        if (obj.language) {
          var lang = obj.language;
          doughnut_label.find(x => {
            if (x == lang) {
              var idx = doughnut_label.indexOf(x);
              var val = doughnut_data[idx];
              val += 1;
              doughnut_data[idx] = val;
            }
          })
        }
      })
      console.log('doughnut_data after totaling values for languages::',doughnut_data);
      console.log('doughnut_label::', doughnut_label);

      //LINE CHART LABELS AND DATA

      var work_tels = works.work_tels;

      var linegraph_data = [];
      var bargraph_data = []; // money spent
      var minutes_bargraph_data = []; // minutes used


      var twelveMonth_label = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];;

      // create linegraph_data Array to have same number of indexes as twelveMonth_label Array
      twelveMonth_label.forEach(function(element) {
        linegraph_data.push(0);
        bargraph_data.push(0);
        minutes_bargraph_data.push(0);


      });
      console.log('after pushing a 0 to mach the # of indexes in label array linegraph_data::', linegraph_data);
      console.log('after pushing a 0 to mach the # of indexes in label array linegraph_data::', bargraph_data);
      console.log('after pushing a 0 to mach the # of indexes in label array linegraph_data::', minutes_bargraph_data);


      work_tels.map(function(obj){
        if (obj.outboundSummary) {
          var createdAt = obj.outboundSummary.createdAt;
          createdAt = new Date(createdAt);
          var month = createdAt.getMonth();
          console.log('month::', month);
          arrayOfObjDates.push(createdAt);

          twelveMonth_label.find(x => {
            var idx = twelveMonth_label.indexOf(x);
            if (month == idx) {
              console.log('inside if (month == idx)::', month, idx);
              // var idx = twelveMonth_label.indexOf(x);

              var val = linegraph_data[idx];
              val += 1;
              linegraph_data[idx] = val;
              console.log('new value of linegraph_data[idx]::', linegraph_data[idx]);


              // var val = bargraph_data[idx];
              console.log('obj::', obj);
              if (obj.money && obj.money.customerCost) {
                console.log('at the top obj.money.customerCost is defined::', obj.money.customerCost);
                console.log('at the top bargraph_data[idx] ::', bargraph_data[idx]);

                var valp = bargraph_data[idx];
                var money = obj.money.customerCost/100;
                // console.log('var money = parseInt(obj.money.customerCost):', money);
                // money = money/100;
                console.log('money/100::', money);
                valp += parseFloat(money.toFixed(2));
                console.log('valp += money', valp);
                console.log('before setting equal to valp bargraph_data[idx]', bargraph_data[idx]);
                bargraph_data[idx] = parseFloat(valp.toFixed(2)); //.toFixed( 2 ); Note that toFixed() returns a string.

                console.log('bargraph_data[idx] = valp', bargraph_data[idx]);
              }
              console.log('new value of bargraph_data[idx]::', bargraph_data[idx]);

              if (obj.outboundSummary && obj.outboundSummary.CallDuration) {
                console.log('obj.outboundSummary.CallDuration is defined::', obj.outboundSummary.CallDuration);
                var val = minutes_bargraph_data[idx];

                if (obj.outboundSummary.durationObj.seconds > 0) {
                  val += parseInt(obj.outboundSummary.durationObj.minutes);
                  val += 1;
                } else {
                  val += parseInt(obj.outboundSummary.durationObj.minutes);
                }
                minutes_bargraph_data[idx] = val;
              }

            }
          })

        }
      })
      console.log('twelveMonth_label after totaling values for work_tels per month::',twelveMonth_label);
      console.log('linegraph_data::', linegraph_data);

      console.log('twelveMonth_label after totaling values for work_tels per month::',twelveMonth_label);
      console.log('bargraph_data::', bargraph_data);
      console.log('minutes_bargraph_data::', minutes_bargraph_data);


      var workitems = works.work;
      var work_tels = works.work_tels;
      console.log('works at top before map:: ', works);

      console.log('just before visualData formation::');

      visualData.doughnut_label = doughnut_label;
      visualData.doughnut_data = doughnut_data; //languages used
      visualData.twelveMonth_label = twelveMonth_label;
      visualData.bargraph_data = bargraph_data;//money spent
      visualData.minutes_bargraph_data = minutes_bargraph_data;//minutes used
      // visualData.linegraph_label = linegraph_label;
      visualData.linegraph_data = linegraph_data; // calls made
      visualData.arrayOfObjDates = arrayOfObjDates;
      console.log('before res.send(visualData) visualData::', visualData);
      return visualData;
    })
    .then(function(visualData) {
      console.log('visualData before res.send(visualData):: ', visualData);
      //APPLY FILTER TO WORK ONSITE

      res.send(visualData);
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

  router.post("/rechargeCustomerAccount", function(req, res, next){
    console.log('rechargeCustomerAccount, req.body::::',req.body);
    console.log('rechargeCustomerAccount, req.user::::',req.user);
    if (req.body.amount && req.body.source) {

      var amount = req.body.amount
      amount = (amount * 100);
      var source = req.body.source.id

      var  customer_id = req.user.epirts.customer.id;
      var chargeObj = {
        amount: amount, // amount in cents, again
        currency: "usd",
        description: "Manual account recharge",
        customer: customer_id, // Previously stored, then retrieved customer
        metadata: {'recharge': 'manual'},
        source: source
      };

      stripe.charges.create(chargeObj).then(function(charge){
        console.log('recharge stripeCustomer balance with :: '+amount+'', charge);
        var data = {};
        data.charge = charge;
        return data;

      }).then(function(data){
        return stripe.customers.retrieve(customer_id)
        .then(function(customer){
          var balance = customer.account_balance;
          if (customer){
            data.stripeCustomer = customer;
            data.balance = balance;
            data.customer_id = customer_id;

            return data;
          }
        })

      }).then(function(data){
        return stripe.customers.update(data.customer_id, {
          account_balance: data.stripeCustomer.account_balance - data.charge.amount
        }).then(function(stripeCustomer){
          console.log('stripeCustomer account_balance updated with recharge amount:: ', stripeCustomer);
          data.rechargedCustomer = stripeCustomer;
          return data;
        })
      }).then(function(data){
        console.log('after customer manual recharge data::',data);
        res.send({customerUpdated:'yes'})
      })
    } else {
      res.send({customerUpdated:'no'})
    }

  });


  router.post("/customerChargeMethodChoice", function(req, res, next){
    console.log('customerChargeMethodChoice, req.body::::',req.body);
    console.log('customerChargeMethodChoice, req.user::::',req.user);
    var reqBody = req.body;
    var userId = req.user._id;
    var autoRechargeValue = '';
    var autoRechargeObj = {};
    var paymentChoice = '';

    if (reqBody.autoRecharge) {
      reqBody.rechargeTo = (reqBody.rechargeTo * 100);
      reqBody.fallsBelow = (reqBody.fallsBelow * 100);
      autoRechargeObj = reqBody;
      console.log('autoRechargeObj::',autoRechargeObj);
      // if (reqBody.autoRecharge == 'enabled' ) {
      //
      //    autoRechargeObj = 'enabled';
      //    paymentChoice = 'autoRecharge'; //this option has been disabled in the html
      // }
      // if (reqBody.autoRecharge == 'disabled' ) {
      //    autoRechargeValue = 'disabled';
      //    paymentChoice = 'none'; //this option has been disabled in the html
      // }

    }
    /*
    else if(reqBody.payPerUseCharge){ //this option has been disabled in the html
    console.log("inside elseif (req.body.payPerUseCharge)");
    if (reqBody.payPerUseCharge == 'enabled' ) {
    paymentChoice = 'payPerUseCharge';
  }
  if (reqBody.payPerUseCharge == 'disabled' ) {
  paymentChoice = 'none';
}

}
*/
//SAVE RECHARGE INFO TO THE DB
// User.findOneAndUpdate({ _id: userId }, { autoPaymentsChoice: paymentChoice }, function(err, user) {
// User.findOneAndUpdate({ _id: userId }, { autoRecharge: autoRechargeValue }, function(err, user) {
//     if (err) throw err;
//     console.log('after saving user"s autoRecharge::',user);
//   });

var promise = User.findOneAndUpdate({ _id: userId }, { 'autoPaymentsChoice.autoRecharge': autoRechargeObj }).exec();
promise.then(function(aUserWithID) {
  console.log('aUserWithID updated autoRecharge field::', aUserWithID);
  return aUserWithID;
}).then(function(aUserWithID) {
  res.send({customerAutoRecharegeSet:'yes'})
})
.catch(function(err){
  console.log('error:', err);
});

});

router.post("/customerDefaultPaymentSource", function(req, res, next){
  console.log('saveUserPii, req.body::::',req.body);
  console.log('saveUserPii, req.user::::',req.user);

  var  customer_id = req.user.epirts.customer.id;
  var acc_id = req.body.acc_id;

  return stripe.customers.update(customer_id, {
    default_source: acc_id
  }).then(function(stripeCustomer){
    console.log('stripeCustomer default_source updated with acc_id:: '+acc_id+'::', stripeCustomer);
  })

  res.json({display_name: 'display_name', country: 'country', currency: 'currency'});
});


router.post("/saveUserPii", function(req, res, next){
  console.log('saveUserPii, req.body::::',req.body);
  console.log('saveUserPii, req.body.id::::',req.body.piiTokenID);

  var Connected_stripe_ID = req.user.epirts.id;
  console.log('req.user::::',req.user);
  console.log('req.user.epirts.id::::',req.user.epirts.id);
  console.log('Connected_stripe_ID::::',Connected_stripe_ID);



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
  data.user = customer;

  //GET CUSTOMER'S BALANCE
  stripe.customers.retrieve(customer_id)
  .then(function(customer){
    var balance;
    if (customer){
      balance = customer.account_balance;
      data.stripeCustomer = customer;
      data.balance = balance;
      data.customer_id = customer_id;
      console.log('found customer in customerMoneyBalance   ');
      return data;
    }
  }).then(function(data){
    console.log('data.customer_id  ::', data.customer_id);
    return stripe.invoices.retrieveUpcoming(data.customer_id).then(function(upcoming){
      console.log('upcoming found::',upcoming);
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
  money_availabel = data.stripeCustomer.account_balance + upcomingInvoicetotal;
  money_availabel = money_availabel*-1;
  money_availabel = money_availabel/100;
  newdata.availabel_balance = money_availabel;

  console.log('newdata::', newdata);
  //FIND
  if (money_availabel > 0 && req.user.accountSuspension && req.user.accountSuspension.suspended == true){
    console.log('if (money_availabel > 0)::', money_availabel);
    var promise = User.findOneAndUpdate({ _id: req.user._id }, { 'accountSuspension.suspended': false }).exec();
    return promise.then(function(aUserWithID) {
      console.log('aUserWithID updated accountSuspension.suspended to true field::', aUserWithID);
      return aUserWithID;
    }).then(function(aUserWithID) {
      // never reaches here
    })
    .catch(function(err){
      console.log('error:', err);
    });
  }else if (money_availabel <= 0) {
    console.log('money_availabel <= 0, just before autoRechargeCustomer(data)::');
    return autoRechargeCustomer(data); //(newdata)
  }else {
    console.log('newdata just before res.send(newdata) in else of money_availabel < 0::',newdata);
    return newdata;
  }

}).then(function(newdata) {
  var dataToSend;
  if (newdata.availabel_balance) {
    dataToSend = newdata;
  }else {
    var money_availabel = newdata.stripeCustomer.account_balance + newdata.upcomingInvoice.total;;
    dataToSend = {availabel_balance:money_availabel};
  }
  console.log('newdata just before res.send(newdata) .then after in else of money_availabel < 0::',newdata);
  res.send(dataToSend);
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

var autoRechargeCustomer = function(data){
  console.log('data at top of autoRechargeCustomer::', data);
  data.stripeCustomer = data.user.epirts.customer;
  if (data.user.autoPaymentsChoice && data.user.autoPaymentsChoice.autoRecharge.rechargeTo) {
    console.log('at top of if (data.user.autoPaymentsChoice && data.user.autoPaymentsChoice.autoRecharge.rechargeTo)::');
    var rechargeTo = parseInt(data.user.autoPaymentsChoice.autoRecharge.rechargeTo);
    rechargeTo = rechargeTo * -1;
    console.log('rechargeTo -40000 after parseInt::', rechargeTo);
    var account_balance = data.stripeCustomer.account_balance;
    console.log('account_balance 1 ::', account_balance);

    console.log('account_balance:: ', account_balance);
    console.log('data.upcomingInvoice.total:: ', data.upcomingInvoice.total);
    var abalanceMinusAmountDue = account_balance + data.upcomingInvoice.total;
    console.log('account_balance + data.upcomingInvoice.total:: ', abalanceMinusAmountDue);
    var fallsbelow = parseInt(data.user.autoPaymentsChoice.autoRecharge.fallsBelow);
    fallsbelow =  fallsbelow * -100;
    console.log('fallsbelow -39000::', fallsbelow);
    if ( abalanceMinusAmountDue > fallsbelow) { //1000 equals $10.00
      //         negative number (credit)         positive number (debit) -9000 > 10000
      console.log('abalanceMinusAmountDue -38275::', abalanceMinusAmountDue); // abalanceMinusAmountDue = -38275
      console.log('fallsbelow -39000::', fallsbelow);

      var reupChargeAmount = rechargeTo - abalanceMinusAmountDue;
      console.log('after fallsbelow - abalanceMinusAmountDue reupChargeAmount::', reupChargeAmount);
      reupChargeAmount = Math.abs(reupChargeAmount);
      console.log('after Math.abs(reupChargeAmount)::', reupChargeAmount);

      console.log('inside if account_balance - data.upcomingInvoice.total < '+fallsbelow+' ::');
      var chargeObj = {
        amount: reupChargeAmount, // amount in cents, again
        currency: "usd",
        description: "Account recharge balance fell below $10 : "+reupChargeAmount,
        customer: data.stripeCustomer.id, // Previously stored, then retrieved customer
        // metadata: {'telephonic_id ': ''+data.telwork._id}
      };
      console.log('chargeObj before stripe.charges.create::', chargeObj);
      return stripe.charges.create(chargeObj).then(function(charge){
        console.log('recharge stripeCustomer balance with :: ', charge);
        data.charge = charge;
        return data;
      }).then(function(data) {
        if (data.charge.captured == true) {
          console.log('data at before update user suspended to false::');
          var promise = User.findOneAndUpdate({ _id: data.user._id }, { 'accountSuspension.suspended': false }).exec();
          return promise.then(function(aUserWithID) {
            console.log('aUserWithID updated accountSuspension.suspended to true field 32::', aUserWithID);
            console.log('newdata updated accountSuspension.suspended to true field 32::', aUserWithID);
            return aUserWithID;
          });
        }else {
          console.log('//do nothing');
          //do nothing
        }
      });
    } else {
      console.log('if (abalanceMinusAmountDue <= 0)::', abalanceMinusAmountDue);
      var promise = User.findOneAndUpdate({ _id: data.user._id }, { 'accountSuspension.suspended': true }).exec();
      return promise.then(function(aUserWithID) {
        console.log('aUserWithID updated accountSuspension.suspended to true field::', aUserWithID);
        console.log('newdata updated accountSuspension.suspended to true field::', aUserWithID);
        return aUserWithID;
      })
      // .then(function(newdata) {
      //   // never reaches here
      //   return newdata;
      //   console.log('should never reach here::', aUserWithID);
      // })
      .catch(function(err){
        console.log('error:', err);
      });

    }
  }

};


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
