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
var moment = require('moment');

var username = "1064627855",
password = "ZLBKgzq2XskgkLj-D4Eo7VUiwo8fucN7",
url = "https://" + username + ":" + password + "@api.payable.com/v1";

var postWork = function(data){
  console.log('inside of postWorkToPayable data.theTeleWorkWithcall_sid | ::', data.theTeleWorkWithcall_sid);
  console.log('inside of postWorkToPayable data.aUserWithWorkerSid::', data.aUserWithWorkerSid);
  var telwork = data.theTeleWorkWithcall_sid;
  var user = data.aUserWithWorkerSid;
  var Hours = 2413827961;
  var videoServiceTypeId = '';
  var videoServiceTypeId = '';
  var OnSiteServiceTypeId = '';
  var timestamp = telwork.outboundSummary.Timestamp;
  var quantity = telwork.outboundSummary.CallDuration;
  var video_work_type_id = 5146377872;
  var onsite_work_type_id = 7413627517;
  var telephonic_work_type_id = 1743526773;


    console.log('quantity fresh::', quantity);
      quantity = parseInt(quantity);
      console.log('quantity parseInt hours::', quantity);
      if (quantity < 60) {
        quantity = 60;
      }
      //if there is a fraction of a minute
      if (quantity % 60 != 0 ) {
        //round  the fraction up one minute
        quantity = parseInt(quantity) + 60;
      }
      console.log('quantity converted to hours::', quantity);
      quantity = Math.round(quantity * 100) / 100;
      console.log('quantity Math.round hours::', quantity);

  var startDateTime = moment(new Date(timestamp)).toISOString();
      console.log('startDateTime toISOString::', startDateTime);
  // var endDateTimeString = moment(startDateTime).add(22, 's').toISOString();
      // console.log('endDateTimeString toString::', endDateTimeString);

   rp.post({
     url:url+'/work',
     form: {
       worker_id : user.payable.worker.id,
       work_type_id : Hours,
       quantity : quantity, //3600 seconds = 1 hour 60 sec  = .01
       start: startDateTime,
      //  end: endDateTimeString,
      //  end:'2016-03-17T010:16:19Z',
       notes:'Hello great job on this assignment '+telwork.shortid+' quantity: '+quantity,
       amount: 500
   }}).then(function(postedwork, body) {
   //  return worker;
   console.log('inside then of Payable postWorkToPayable, httpResponse::', postedwork);
   console.log('inside then of Payable postWorkToPayable, body::', body);
   //@TODO save worker returned object to mongo
   if (!telwork.money) {
     telwork.money = {};
   }
  console.log('setting telwork.money.payable = postedwork;');
   telwork.money.payable = JSON.parse(postedwork);
  //  telwork.money.amount = '';

   telwork.save();
   console.log('the worker payable returned object has been saved, telwork::', telwork);
 })
 .catch(function(err){
   // just need one of these
   console.log('error:', err);
 });



};

var createWorker = function(user){

 rp.post({
   url:url+'/workers',
   form: {
     display_name : user.firstname +" "+ user.lastname,
     first_name : user.firstname,
     last_name : user.lastname,
     email: user.email,
     invite: true
 }}).then(function(worker) {
   //  return worker;
   console.log('inside then of Payable createWorker, worker::', worker);
   var workerJSON = JSON.parse(worker);
   //Save worker returned object to mongo
    User.findOneAndUpdate({ _id: user._id }, { payable: {worker: workerJSON} }, function(err, user) {
      if (err) throw err;
      // we have the updated user returned to us
      console.log('after saving user"s payable info:: ',user);
    });

 })
 .catch(function(err){
   // just need one of these
   console.log('promise error:', err);
 });

};


module.exports = {
  'createWorker' : createWorker,
  'postWork': postWork
};
