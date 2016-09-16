var stripe = require("stripe")('sk_test_SfT5Rf2DMVfT0unJf7aIIskQ');

var mongoose = require("mongoose");
var Promise = require('bluebird');
// set Promise provider to bluebird
mongoose.Promise = require('bluebird');
var User = require('../models/user');
var Work = require('../models/work');
var Work_Tel = require('../models/work_tel');
// var Work_Tel = mongoose.model('Work_Tel');
Promise.promisifyAll(Work_Tel);
Promise.promisifyAll(Work_Tel.prototype);


var weekly = function(data){
  console.log('inside weekly function data::', data);
  //find the local customer
  var customerid = data.theTeleWorkWithcall_sid.customer_id;
  var promise = User.findById(customerid).exec();
  promise.then(function(customer) {
    console.log('customer found ::', customer);

    // customer.save();
    return customer;
  })
  // .then(function(customer) {
  //   console.log('inside the then customer::', customer);
  //   var contractorid = theTeleWorkWithcall_sid.contractor_id;
  //   console.log('theTeleWorkWithcall_sid::', theTeleWorkWithcall_sid);
  //   console.log('contractorid::', contractorid);
  //   var promise = User.findById(contractorid).exec();
  //   promise.then(function(contractor) {
  //     console.log('contractor found ::', contractor);
  //
  //     // contractor.save();
  //     return contractor;
  //   })
  // })
  .then(function(customer) {
    // console.log('inside the then contractor::', contractor);
    console.log('inside the then after found customer: customer::', customer);
    console.log('inside the then after found customer: data.theTeleWorkWithcall_sid.contractor_id::', data.theTeleWorkWithcall_sid.contractor_id);
    console.log('inside the then after found customer: data.theTeleWorkWithcall_sid::', data.theTeleWorkWithcall_sid);
    var contractor_id = data.theTeleWorkWithcall_sid.contractor_id;
    var theTeleWorkWithcall_sid = data.theTeleWorkWithcall_sid;
    // console.log('add invoiceitem to contractor in stripe::');
    //add invoiceitem to contractor in stripe
    var promise = User.findById(contractor_id).exec();
    promise.then(function(contractor) {
      console.log('contractor found ::', contractor);
      createStripeInvoiceItem(customer, theTeleWorkWithcall_sid, contractor);
      // return contractor;
    })
  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
  });


};


var perEvent = function(data){
  console.log('inside weekly function data::', data);
  //find the local customer
  var customerid = data.theTeleWorkWithcall_sid.customer_id;
  var promise = User.findById(customerid).exec();
  promise.then(function(customer) {
    console.log('customer found ::', customer);

    // customer.save();
    return customer;
  })

  .then(function(customer) {
    // console.log('inside the then contractor::', contractor);
    console.log('inside the then after found customer: customer::', customer);
    console.log('inside the then after found customer: data.theTeleWorkWithcall_sid.contractor_id::', data.theTeleWorkWithcall_sid.contractor_id);
    console.log('inside the then after found customer: data.theTeleWorkWithcall_sid::', data.theTeleWorkWithcall_sid);
    var contractor_id = data.theTeleWorkWithcall_sid.contractor_id;
    var theTeleWorkWithcall_sid = data.theTeleWorkWithcall_sid;
    // console.log('add invoiceitem to contractor in stripe::');
    //add invoiceitem to contractor in stripe
    var promise = User.findById(contractor_id).exec();
    promise.then(function(contractor) {
      console.log('contractor found ::', contractor);
      createStripeCharge(customer, theTeleWorkWithcall_sid, contractor);
      // return contractor;
    })
  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
  });


};


var createStripeCharge = function(customer, theTeleWorkWithcall_sid, contractor){
  console.log('contractor in createStripeInvoiceItem::', contractor);
  console.log('customer in createStripeInvoiceItem::', customer);
  console.log('theTeleWorkWithcall_sid in createStripeInvoiceItem::', theTeleWorkWithcall_sid);
  console.log('customer.epirts.customer.id in createStripeInvoiceItem::', customer.epirts.customer.id);
  var duration = theTeleWorkWithcall_sid.outboundSummary.CallDuration;
  var rate = 3.35/60;
  // var amount = Math.round(100*duration*rate)/100;
  // console.log('amount after Math.round/100::', amount);
  var amount = Math.round(100*duration*rate);
  console.log('amount Math.round::', amount);
  // amount = 11000;
  // amount = (amount*100).toFixed( 2 );
  // console.log('(amount*100).toFixed( 2 )::', amount);

  var app_fee = Math.round(amount*.70);
  console.log('app_fee::', app_fee);
  console.log('amount after Math.round to 100th and x 100 to get in pennies::', amount);
  console.log('rate::', rate);
  console.log('duration::', duration);
  console.log('contractor.epirts.account.id::', contractor.epirts.account.id);

stripe.charges.create({
    amount: amount, // amount in cents, again
    currency: "usd",
    description: "cost of telephonic: "+theTeleWorkWithcall_sid._id,
    customer: customer.epirts.customer.id, // Previously stored, then retrieved customer
    destination: contractor.epirts.account.id,
    application_fee: app_fee,
    metadata: {'telephonic_id ': ''+theTeleWorkWithcall_sid._id}
  }, function(err, charge) {
    if (err) {console.log('err after charges create::', err);
  } else if(charge) {
    console.log('charge::',charge);
    theTeleWorkWithcall_sid.money = {};
    theTeleWorkWithcall_sid.money.charge = charge;
    theTeleWorkWithcall_sid.money.app_fee = app_fee;
    costDollars = Math.floor(amount/100);
    costPennies = amount % 100;
    theTeleWorkWithcall_sid.money.cost = {inPennies : amount, costDollars : costDollars, costPennies : costPennies};
    theTeleWorkWithcall_sid.money.worker_pay = amount-app_fee;
    theTeleWorkWithcall_sid.save();
    console.log('new theTeleWorkWithcall_sid::', theTeleWorkWithcall_sid);
  }

    if (err && err.type === 'StripeCardError') {
      // The card has been declined
    }


  });


};

var createStripeInvoiceItem = function(customer, theTeleWorkWithcall_sid, contractor){
  console.log('contractor in createStripeInvoiceItem::', contractor);
  console.log('customer in createStripeInvoiceItem::', customer);
  console.log('theTeleWorkWithcall_sid in createStripeInvoiceItem::', theTeleWorkWithcall_sid);
  console.log('customer.epirts.customer.id in createStripeInvoiceItem::', customer.epirts.customer.id);
  var duration = theTeleWorkWithcall_sid.outboundSummary.CallDuration;
  var rate = 3.35/60;
  var amount = Math.round(100*duration*rate)/100;
  console.log('amount before parseInt::', amount);
  amount = 11000;
  console.log('amount after Math.round to 100th and x 100 to get in pennies::', amount);
  console.log('rate::', rate);
  console.log('duration::', duration);
  console.log('contractor.epirts.account.id::', contractor.epirts.account.id);

  //retrieve the account check if there is a subscription, if not, add one



  //add invoice item
  // stripe.invoiceItems.create({ /* invoice-y stuff*/ }, {stripe_account: CONNECTED_STRIPE_ACCOUNT_ID}, done);
  /*
  stripe.invoiceItems.create({
  customer: customer.epirts.customer.id,
  amount: amount,
  currency: "usd",
  description: "cost of telephonic: "+theTeleWorkWithcall_sid._id
  // application_fee: 100
  }, {stripe_account: contractor.epirts.account.id})
  .then(function(charge) {
  console.log('charge in then after invoiceItem::', charge);
  console.log('theTeleWorkWithcall_sid in then after invoiceItem::', theTeleWorkWithcall_sid);
  // Get customer's account balance from stripe
  return stripe.customers.retrieve(customer.epirts.customer.id);
}).then(function(customer) {
  //then update customer in MongoDB
console.log('customer after retrieve customer::', customer);
}, function(err) {if (err) {console.log('err after invoiceItems create::', err);}});
  */

/*
stripe.invoiceItems.create({
customer: SHARED_CUSTOMER_ID,
amount: 2500,
currency: "usd",
description: "cost of work "
},{application_fee: 100}, {stripe_account: CONNECTED_STRIPE_ACCOUNT_ID})
.then(function(charge) {

}).then(function() {
}, function(err) {if (err) {console.log('err ', err);}});
*/

/* works
stripe.charges.create({
customer: customer.epirts.customer.id,
amount: amount,
currency: "usd",
description: "cost of telephonic: "+theTeleWorkWithcall_sid._id
// application_fee: 100
}, {stripe_account: contractor.epirts.account.id})
.then(function(charge) {
console.log('charge in then after invoiceItem::', charge);
console.log('theTeleWorkWithcall_sid in then after invoiceItem::', theTeleWorkWithcall_sid);
// Get customer's account balance from stripe
return stripe.customers.retrieve(customer.epirts.customer.id);
}).then(function(customer) {
//then update customer in MongoDB
console.log('customer after retrieve customer::', customer);
}, function(err) {if (err) {console.log('err after invoiceItems create::', err);}});
*/

stripe.charges.create({
    amount: amount, // amount in cents, again
    currency: "usd",
    description: "cost of telephonic: "+theTeleWorkWithcall_sid._id,
    customer: customer.epirts.customer.id, // Previously stored, then retrieved customer
    destination: contractor.epirts.account.id,
    application_fee: 123,
    metadata: {'telephonic_id ': ''+theTeleWorkWithcall_sid._id}
  }, function(err, charge) {
    if (err) {console.log('err after charges create::', err);
  } else if(charge) {
    console.log('charge::',charge);
  }

    // Work.findById(req.body._id, function(err, work){
    //   console.log('INSIDE complete on server work:', work);
    //   if(err){
    //     console.log(err);
    //   }
    //   work.epirts.charge_id = charge.id;
    //   // save the work
    //   work.save(function(err, work) {
    //     console.log('WORK UPDATED WITH COMPLETE !!!!!!!');
    //     postToPayable();
    //     stripeChargePay(work);
    //     if (err)
    //     res.send(err);
    // });
    // });
    if (err && err.type === 'StripeCardError') {
      // The card has been declined
    }


  });


};



module.exports = {
'weekly': weekly,
'perEvent' : perEvent
};
