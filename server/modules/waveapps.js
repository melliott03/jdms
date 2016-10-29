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


var request = require("request");//needed for request-promise to work
var rp = require('request-promise'); //need both request and request-promise for the later to work

var username = "1064627855",
password = "ZLBKgzq2XskgkLj-D4Eo7VUiwo8fucN7",
url = "https://" + username + ":" + password + "@api.payable.com/v1";

var postToPayable = function(){
  request.post({
    url:url+'/work',
    form: {
      worker_id : '2665370794',
      work_type_id : 2413827961,
      quantity : 24,
      start:'2016-03-17T08:16:19Z',
      end:'2016-03-17T010:16:19Z',
      notes:'Hello great job on this assignment Ben',
      amount: 500
  }},
  function(err,httpResponse,body){

    console.log('body in app.post return from Payable ',body);
    // res.send(body);
 });
};

var createCustomer = function(user){
  // request("foo.bar").then(function(result) {
  //
  // });
 rp.post({
   url:url+'/workers',
   form: {
     display_name : user.firstname +" "+ user.lastname,
     first_name : user.firstname,
     last_name : user.lastname,
     email: user.email,
     invite: true
 }}).then(function(customer, body) {
   //  return customer;
   console.log('inside then of Payable createCustomer, customer::', customer);
 })
 .catch(function(err){
   // just need one of these
   console.log('error:', err);
 });

};


module.exports = {
  'createCustomer' : createCustomer,
  'postToPayable': postToPayable
};
