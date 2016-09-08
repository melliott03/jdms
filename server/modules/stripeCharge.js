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

var createStripeInvoiceItem = function(customer, theTeleWorkWithcall_sid, contractor){
  console.log('contractor in createStripeInvoiceItem::', contractor);
  console.log('customer in createStripeInvoiceItem::', customer);
  console.log('theTeleWorkWithcall_sid in createStripeInvoiceItem::', theTeleWorkWithcall_sid);
  console.log('customer.epirts.customer.id in createStripeInvoiceItem::', customer.epirts.customer.id);
  var duration = theTeleWorkWithcall_sid.outboundSummary.CallDuration;
  var rate = 3.35/60;
  var amount = Math.round(100*duration*rate)/100;
  console.log('amount before parseInt::', amount);
  amount = amount*100;
  console.log('amount after Math.round to 100th and x 100 to get in pennies::', amount);
  console.log('rate::', rate);
  console.log('duration::', duration);
  console.log('contractor.epirts.account.id::', contractor.epirts.account.id);


  //add invoice item
  stripe.invoiceItems.create({
  customer: customer.epirts.customer.id,
  amount: amount,
  currency: "usd",
  // destination: contractor.epirts.account.id,
  // application_fee: 10,
  description: "cost of telephonic: "+theTeleWorkWithcall_sid._id
}).then(function(charge) {
  console.log('charge in then after invoiceItem::', charge);
  console.log('theTeleWorkWithcall_sid in then after invoiceItem::', theTeleWorkWithcall_sid);
  // Get customer's account balance from stripe
  return stripe.customers.retrieve(customer.epirts.customer.id);
}).then(function(customer) {
  //then update customer in MongoDB
console.log('customer after retrieve customer::', customer);
}, function(err) {if (err) {console.log('err after invoiceItems create::', err);}});

}



module.exports = {
'weekly': weekly
};
