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
  .then(function(customer) {
    // console.log('inside the then contractor::', contractor);
    console.log('inside the then after found customer: customer::', customer);
    console.log('inside the then after found customer: data.theTeleWorkWithcall_sid.contractor_id::', data.theTeleWorkWithcall_sid.contractor_id);
    console.log('inside the then after found customer: data.theTeleWorkWithcall_sid::', data.theTeleWorkWithcall_sid);
    var contractor_id = data.theTeleWorkWithcall_sid.contractor_id;
    var theTeleWorkWithcall_sid = data.theTeleWorkWithcall_sid;
    var promise = User.findById(contractor_id).exec();
    promise.then(function(contractor) {
      console.log('contractor found ::', contractor);
      createStripeInvoiceItem(customer, theTeleWorkWithcall_sid, contractor);
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
  var amount = Math.round(100*duration*rate);
  console.log('amount Math.round::', amount);

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
    console.log('theTeleWorkWithcall_sid.moneySummary::', theTeleWorkWithcall_sid.moneySummary);
    if (!theTeleWorkWithcall_sid.moneySummary) {
      theTeleWorkWithcall_sid.moneySummary = {};
    }
    theTeleWorkWithcall_sid.moneySummary.charge = charge;
    theTeleWorkWithcall_sid.moneySummary.app_fee = app_fee;
    costDollars = Math.floor(amount/100);
    costPennies = amount % 100;
    theTeleWorkWithcall_sid.moneySummary.cost = {inPennies : amount, costDollars : costDollars, costPennies : costPennies};
    theTeleWorkWithcall_sid.moneySummary.worker_pay = amount-app_fee;
    theTeleWorkWithcall_sid.save();
    console.log('new theTeleWorkWithcall_sid::', theTeleWorkWithcall_sid);
  }

    if (err && err.type === 'StripeCardError') {
      // The card has been declined
    }


  });


};

var createStripeInvoiceItem = function(data){
  var customer = data.aUserWithCustomer_ID;
  var contractor = data.aUserWithWorkerSid;
  var telwork = data.theTeleWorkWithcall_sid;

  console.log('contractor in createStripeInvoiceItem::', contractor);
  console.log('customer in createStripeInvoiceItem::', customer);
  console.log('telwork in createStripeInvoiceItem::', telwork);
  console.log('customer.epirts.customer.id in createStripeInvoiceItem::', customer.epirts.customer.id);
  var duration = telwork.outboundSummary.CallDuration;
  if (duration < 60) {
    duration = 60;
  }
  //if there is a fraction of a minute
  if (duration % 60 != 0 ) {
    //round  the fraction up one minute
    duration = parseInt(duration) + 60;
  }
  var rate = 3.35/60;
  var amount = duration*rate;
  console.log('amount before amount.toFixed( 2 )*100::', amount);
      amount = amount.toFixed( 2 )*100;
  console.log('amount after amount.toFixed( 2 )*100::', amount);
  // amount = 11000;
  console.log('amount after Math.round to 100th and x 100 to get in pennies::', amount);
  console.log('rate::', rate);
  console.log('duration::', duration);
  console.log('contractor.epirts.account.id::', contractor.epirts.account.id);

stripe.invoiceItems.create({
    customer: customer.epirts.customer.id, // Previously stored, then retrieved customer
    amount: amount, // amount in cents, again
    currency: "usd",
    description: "cost of telephonic: "+telwork._id,
    // destination: contractor.epirts.account.id,
    // application_fee: 123,
    metadata: {'telephonic_id': ''+telwork._id, 'shortid': ''+telwork.shortid }
  }, function(err, charge) {
    if (err) {console.log('err after charges create::', err);
  } else if(charge) {
    console.log('charge::',charge);
  }

  if (err && err.type === 'StripeCardError') {
    // The card has been declined
  }

  });


};


var prePaid = function(data){
  //GET ALL MY VARIABLES READY
  console.log('inside prePaid 1::');
  var customer = data.aUserWithCustomer_ID;
  var contractor = data.aUserWithWorkerSid;
  var telwork = data.theTeleWorkWithcall_sid;
  var customer_id = customer.epirts.customer.id;
  data.telwork = telwork;

    //ADJUST THE DURATION IF NECESSARY
  var duration = telwork.outboundSummary.CallDuration;
  if (duration < 60) {
    duration = 60;
  }
    //if there is a fraction of a minute
  if (duration % 60 != 0 ) {
    //round  the fraction up one minute
    duration = parseInt(duration) + 60;
  }
  var rate = 3.35/60;
  var amount = duration*rate;
      amount = amount.toFixed( 2 )*100;
  //GET CUSTOMER'S BALANCE
  stripe.customers.retrieve(customer_id)
  .then(function(customer){
    var balance = customer.account_balance;
      if (customer){
        console.log('inside prePaid customer::');
        data.stripeCustomer = customer;
        data.balance = balance;
        data.customer_id = customer_id;
        return data;
      }else {
        console.log('err 1 inside prePaid::');
      }
  })
  .then(function(data){
    console.log('inside prePaid 2::');
    return stripe.invoices.retrieveUpcoming(data.customer_id).then(
    function(upcoming) {
      console.log('inside prePaid 3::');
      data.upcomingInvoice = upcoming;
      return data;
    },
    function(err) {
      console.log('inside prePaid 4::');
      var upcoming = {};
      upcoming.total = 0;
      data.upcomingInvoice = upcoming;
      return data;
    })

  })

  .then(function(data){
    console.log('just before data.balance - data.upcomingInvoice data::',data);

    if (data.aUserWithCustomer_ID.autoPaymentsChoice && data.aUserWithCustomer_ID.autoPaymentsChoice.autoRecharge.rechargeTo) {
          var rechargeTo = parseInt(data.aUserWithCustomer_ID.autoPaymentsChoice.autoRecharge.rechargeTo);
              rechargeTo = rechargeTo * -100;
              console.log('rechargeTo -40000 after parseInt::', rechargeTo);
          var account_balance = data.stripeCustomer.account_balance;
          console.log('account_balance 1 ::', account_balance);

          console.log('data.stripeCustomer.account_balance:: ', data.stripeCustomer.account_balance);
          console.log('data.upcomingInvoice.total:: ', data.upcomingInvoice.total);
          var abalanceMinusAmountDue = data.stripeCustomer.account_balance + data.upcomingInvoice.total;
          console.log('data.stripeCustomer.account_balance + data.upcomingInvoice.total:: ', abalanceMinusAmountDue);
          var fallsbelow = parseInt(data.aUserWithCustomer_ID.autoPaymentsChoice.autoRecharge.fallsBelow);
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

              console.log('inside if data.stripeCustomer.account_balance - data.upcomingInvoice.total < '+fallsbelow+' ::');
              var chargeObj = {
                  amount: reupChargeAmount, // amount in cents, again
                  currency: "usd",
                  description: "Account recharge balance fell below $10 : "+reupChargeAmount,
                  customer: data.customer_id, // Previously stored, then retrieved customer
                  metadata: {'telephonic_id ': ''+data.telwork._id}
              };
              console.log('chargeObj before stripe.charges.create::', chargeObj);
            return stripe.charges.create(chargeObj).then(function(charge){
              console.log('recharge stripeCustomer balance with :: ', charge);
              data.charge = charge;
              return data;
            })
          } else {
            if (abalanceMinusAmountDue <= 0) {
              //suspend the account
              var promise = User.findOne({ _id: userId }, { 'accountSuspension.suspended': true }).exec();
              promise.then(function(aUserWithID) {
                console.log('aUserWithID updated accountSuspension.suspended to true field::', aUserWithID);
                return aUserWithID;
              }).then(function(aUserWithID) {
                // res.send({customerAutoRecharegeSet:'yes'})
              })
              .catch(function(err){
                console.log('error:', err);
              });
            }
            return data;
          }
    } else {
      return data;
    }

  })
  .then(function(data){
    console.log('just before data.balance - data.upcomingInvoice data 2::',data);
    if (data.charge) {
      return stripe.customers.update(data.customer_id, {
        account_balance: data.stripeCustomer.account_balance - data.charge.amount
      }).then(function(stripeCustomer){
        console.log('stripeCustomer account_balance updated with recharge amount:: ', stripeCustomer);
        data.rechargedCustomer = stripeCustomer;
        return data;
      })
    } else {
      return data;
    }

  })
  .then(function(data){
    console.log('data before stripe.invoiceItems.create::', data);
    stripe.invoiceItems.create({
        customer: customer_id, // Previously stored, then retrieved customer
        amount: amount, // amount in cents, again
        currency: "usd",
        description: "cost of telephonic: "+telwork._id,
        // destination: contractor.epirts.account.id,
        // application_fee: 123,
        metadata: {'telephonic_id': ''+telwork._id, 'shortid': ''+telwork.shortid }
      }, function(err, invoiceItem) {
        if (err) {console.log('err after charges create::', err);
      } else if(invoiceItem) {
            console.log('inside else if invoiceItem::',invoiceItem);
            console.log('telwork',telwork);
            var theTeleWorkWithcall_sid = data.theTeleWorkWithcall_sid;
            // telwork.amount = ''+amount;
            // if (!telwork.moneySummary) {
            //   console.log('inside if (!telwork.moneySummary)');
            //   telwork.moneySummary = {};
            // }
            // console.log('setting telwork.moneySummary.customerCost = ');
            // telwork.moneySummary.customerCost = ''+amount;
            // telwork.save();
            // console.log('in else if(invoiceItem) telwork after save::');
            saveMoneyToDB(telwork, amount);
            /*
            data.invoiceItemCreated = invoiceItem;
            //
            //
            if (data.rechargedCustomer) {
              stripeCustomer = data.rechargedCustomer;
            } else if(data.stripeCustomer) {
              stripeCustomer = data.stripeCustomer;
            }
              return stripe.customers.update(data.customer_id, {
                account_balance: stripeCustomer.account_balance
              }).then(function(stripeCustomer){
                console.log('stripeCustomer account_balance updated with recharge amount:: '+reupChargeAmount+'', stripeCustomer);
                data.reRechargedCustomer = stripeCustomer;
                return data;
              })
            */
        return data;
      }

      if (err && err.type === 'StripeCardError') {
        // The card has been declined
      }

      });

      // customerPrepaidBalance = account_balance - upcomingInvoice.amount_due
  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
    if (err && err.type === 'StripeInvalidRequestError') {
      // There is no upcoming invoice
      console.log('the user has no upcoming invoice');
    }
  });

};



var getCustomerAccountDetails = function(user){
  //GET ALL MY VARIABLES READY
  var customer_id = user.epirts.customer.id;

  //GET CUSTOMER'S BALANCE
  stripe.customers.retrieve(customer_id)
  .then(function(customer){
    console.log('customer object retreived::', customer);
    var data = {};
    data.balance = customer.account_balance;
    data.balance = customer.account_balance;


    var balance = customer.account_balance;
      if (customer){
        return customer;
      }
  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
  });

};
/*
var saveMoneyToDB = function(telworkitem, amount){
  console.log('top of saveMoneyToDB telworkitem::', telworkitem);
  var promisedi = Work_Tel.findOne({_id: telworkitem._id}).exec();
  promisedi.then(function(theTeleWorkWithCallSid2) {
    console.log('theTeleWorkWithCallSid2 inside saveMoneyToDB::', theTeleWorkWithCallSid2);
    console.log('amount inside saveMoneyToDB::', amount);
    if (!theTeleWorkWithCallSid2.money) {
      console.log('inside   if (!theTeleWorkWithCallSid2.money:: ');
      theTeleWorkWithCallSid2.money = {};
      theTeleWorkWithCallSid2.money.customerCost = amount;
    } else {
      console.log('inside else (!theTeleWorkWithCallSid2.money:: ');
      theTeleWorkWithCallSid2.money.customerCost = ''+amount;
      console.log('theTeleWorkWithCallSid2.money.customerCost:: ', theTeleWorkWithCallSid2.money.customerCost);
      console.log('theTeleWorkWithCallSid2.money:: ', theTeleWorkWithCallSid2.money);

    }
    // theTeleWorkWithCallSid2.taskSid = req.query.TaskSid;
    theTeleWorkWithCallSid2.save(function (err, doc) {
                    if (err) {
                      console.log('err theTeleWorkWithCallSid2.save():: ', err);
                        // res.json({error: true, msg: JSON.stringify(err)});
                    }
                    else {

                      console.log('success theTeleWorkWithCallSid2.save() doc:: ', doc);
                        // res.json({success: true, cra: cra})
                    }
                  });
    console.log('after theTeleWorkWithCallSid2.save():: ');

    console.log();
    return theTeleWorkWithCallSid2;
  })
  .then(function(theTeleWorkWithCallSid2) {
    // Do nothing
  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
  });

}
*/
var saveMoneyToDB = function(data, amount){
  console.log('saveMoneyToDB data::', data);
  console.log('saveMoneyToDB amount::', amount);

  var CallSid = data.inboundCallSid;
  var promised = Work_Tel.findOne({inboundCallSid: CallSid}).exec();
  promised.then(function(telwork) {
    console.log('telwork in saveMoneyToDB function::', telwork);

    // telwork.amount = ''+amount;
    // if (!telwork.moneySummary) {
    //   console.log('inside if (!telwork.moneySummary)');
      // telwork.moneySummary = {};
    // }
    if (!telwork.money) {
      telwork.money = {};
    }
    console.log('setting telwork.moneySummary.customerCost = ');
    // telwork.moneySummary.customerCost = ''+amount;
    telwork.money.customerCost = amount;
    telwork.markModified('money');
    // telwork.markModified('moneySummary');
    telwork.save();

    // telwork.moneySummary.customerCost = '';
    // telwork.moneySummary.customerCost = ''+amount;
    // telwork.taskSid = req.query.TaskSid;
    // telwork.save();
    return telwork;
  })
  .then(function(telwork) {
    // Do nothing
  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
  });

}

module.exports = {
'weekly': weekly,
'perEvent' : perEvent,
'createStripeInvoiceItem': createStripeInvoiceItem,
'prePaid': prePaid
};
