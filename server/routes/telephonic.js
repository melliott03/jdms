var express = require('express');
var router = express.Router();
var configsty = require('config-node');

var twilio = require('twilio');
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

var moment = require('moment');

var shortid = require('shortid');

var stripeCharge = require('../modules/stripeCharge');

var payable = require('../modules/payable');

router.post('/CallCenterCallback', twilio.webhook({validate: false}), (req, res) => {
  //twilio@3.3.1-edge
  console.log("req.body in router.post CallCenterCallback::", req.body);
  // var callbody = req.body;
  var workerSid = req.body.WorkerSid;

  if (req.body.EventType == 'reservation.accepted' && req.body.TaskSid && req.body.WorkflowName == 'VideoWorkflow') {
    console.log('Im inside the eventtype = reservation.accepted req.body.WorkflowName == VideoWorkflow, telephonic/CallCenterCallback req.body::', req.body);

    var accountSid = configsty.TWILIO_ACCOUNT_SID;
    var authToken = configsty.TWILIO_AUTH_TOKEN;
    var workspaceSid = 'WS74baf6dd30ead8306f310450b290cbb2';
    var workflowSid = "WW4641b95360367b10cec28753644d043c";
    var videoChannelSid = 'TC2eae701e12864f7382abbe99d53ecacf';


    var client = new twilio.TaskRouterClient(accountSid, authToken, workspaceSid);

    //find user in mongo with matching workerSid and add there contractor_id
    var promisen = User.findOne({'twilioSids.workerSid': workerSid}).exec();
    promisen.then(function(aUserWithWorkerSid) {
      console.log('aUserWithWorkerSid | ::', aUserWithWorkerSid);
      return aUserWithWorkerSid;
    })
    .then(function(aUserWithWorkerSid) {
      /*
      // complete a task
      var taskSid = req.body.TaskSid;
      client.workspace.tasks(taskSid).update({
          assignmentStatus: 'completed', //pending, reserved, assigned, canceled, and completed
          reason: 'video call completed'
      }, function(err, task) {
        if (task) {
          console.log('task::', task);
          console.log(task.assignment_status);
          console.log(task.reason);

          //update worker activity_sid
          var post_work_activity_sid = 'WAbaf024ac1c7fc5d4b9f138173ac3ca12';
          var workerSid = aUserWithWorkerSid.twilioSids.workerSid;
          // console.log('worker_activity_sid before updating post_work_activity_sid::', );
          client.workspace.workers(workerSid).update({
              // attributes: '{"type":"support"}'
              activitySid: post_work_activity_sid
          }, function(err, worker) {
            if (err) console.log('err updating post_work_activity_sid::', err);
              console.log('worker after updating post_work_activity_sid::', worker);
          });


        } else if (err) {
          console.log('err in task complete::',err);
        }

      });
      */
    })
    .catch(function(err){
      // just need one of these
      console.log('error:', err);
    });
  } else if (req.body.EventType == 'reservation.accepted' && req.body.TaskSid) {
    console.log('Im inside the eventtype = reservation.accepted, telephonic/CallCenterCallback req.body::', req.body);

    //find user in mongo with matching workerSid and add there contractor_id
    var promise = User.findOne({'twilioSids.workerSid': workerSid}).exec();
    promise.then(function(aUserWithWorkerSid) {
      console.log('aUserWithWorkerSid | ::', aUserWithWorkerSid);
      return aUserWithWorkerSid;
    })
    .then(function(aUserWithWorkerSid) {
      // do something with
      res.sendStatus(200);
    })
    .catch(function(err){
      // just need one of these
      console.log('error:', err);
    });
  }else {
    //do nothing
  }
  // res.status(200);

});

router.use('/VoiceAssignmentCallbackUrl', twilio.webhook({validate: false}), (req, res) => {
  //twilio@3.3.1-edge
  console.log("req.query in app.post AssignmentCallbackUrl::", req.query);
  console.log("req.body in app.post AssignmentCallbackUrl::", req.body);
  var callbody = req.body;
  var accountSid = configsty.TWILIO_ACCOUNT_SID;
  var authToken = configsty.TWILIO_AUTH_TOKEN;
  var workspaceSid = callbody.WorkspaceSid;
  var taskSid = callbody.TaskSid;
  var reservationSid = callbody.ReservationSid;

  console.log('callbody.TaskAttributes::', callbody.TaskAttributes);
  var str =  callbody.TaskAttributes;
  console.log('callbody.TaskAttributes.call_sid JSON.stringify::', JSON.stringify(eval('('+str+')')) );
  console.log('callbody.TaskAttributes.call_sid JSON.parse(str)::', JSON.parse(str) );
  str = JSON.parse(str);

  console.log('str.call_sid::', str.call_sid );
  var call_sid = str.call_sid;
  var assignmentInstruction = {
    instruction: 'call',
    // post_work_activity_sid: 'WA442ed2a8dcf0fa1b169207b8cd80dbab',
    url: configsty.APP_URL+'/telephonic/screencall?reservationSid='+reservationSid,
    status_callback_url: configsty.APP_URL+'/telephonic/callSummary?callSid='+call_sid+'&workerSid='+callbody.WorkerSid+'&TaskSid='+callbody.TaskSid,
    from: '+16122172551' // a verified phone number from your twilio account
  };
  res.header('Content-Type', 'application/json');
  res.json(assignmentInstruction);
});

//https://www.twilio.com/docs/tutorials/walkthrough/ivr-phone-tree/node/express#6
// POST: '/ivr/welcome'
router.post('/welcome', twilio.webhook({validate: false}), function (request, response) {
    var twiml = new twilio.TwimlResponse();
    twiml.gather({
        action: "/telephonic/telephonicUserID",
        numDigits: "7",
        method: "POST"
    }, function (node) {
        twiml.say("Thank you for calling Now Language TeleInterpret Service - the world's best choice for language interpreting services. Please enter your 7 digit user ID");

        // twiml.say('Please choose the language of interpretation. Spanish, 1. Hmong, 2. Somali, 3. Oromo, 4. Amharic, 5.');

        // node.play("http://howtodocs.s3.amazonaws.com/et-phone.mp3", {loop: 3});
    }); //.redirect('/telephonic/welcome');
    response.send(twiml);
});

// POST: '/ivr/menu'
router.post('/telephonicUserID', twilio.webhook({validate: false}), function (request, response) {
    var twiml = new twilio.TwimlResponse();

    var telephonicUserID = request.body.Digits;
    if (telephonicUserID.length < 7 ) {
      console.log('telephonicUserID.length::', telephonicUserID.length);
      // twiml.say('Your User ID must be 7 degits. Please try again.');
      twiml.redirect('/telephonic/welcome');
    }else {
      twiml.gather({
          action: "/telephonic/telephonicPassCode?ID=" + telephonicUserID,
          numDigits: "4",
          method: "POST"
      }, function (node) {
          twiml.say('Please enter your 4 digit pass code');
      });
    }
    /*
    else {
    console.log('telephonicUserID 1::', telephonicUserID);
    // findUserInDB(telephonicUserID, twiml);
    var promise = User.findOne({telephonicID: telephonicUserID}).exec();
    return promise.then(function(aUserWithID) {
      console.log("aUserWithID 1::", aUserWithID);

      if (aUserWithID == undefined || aUserWithID == null) {
        console.log("aUserWithID 2::", aUserWithID);
        twiml.say('You entered an incorrect User ID');
        twiml.redirect('/telephonic/welcome');
        return aUserWithID;
      } else if (aUserWithID != null) {
        console.log("aUserWithID 3::", aUserWithID);
        return aUserWithID;
      }
      //Gather the USERID and the Password then find see if that combination exists in the DB
      //that way, hackers can't dial until the figure out a userID (by not validating after UserID is entered)

    })
    .then(function(aUserWithID) {
      // do something with
        console.log("I'm inside of .then (aUserWithID) 1::", aUserWithID);
        // var twiml = new twilio.TwimlResponse();
        if (aUserWithID == undefined || aUserWithID == null) {
          console.log("I'm inside of .then (aUserWithID) 2::", aUserWithID);
          twiml.say('You entered an incorrect User ID');
          twiml.redirect('/telephonic/welcome');
          response.send(twiml);
        } else if(aUserWithID._id) {
          console.log("I'm inside of .then (aUserWithID) 3::", aUserWithID);
          twiml.gather({
              action: "/telephonic/telephonicPassCode?ID=" + telephonicUserID,
              numDigits: "4",
              method: "POST"
          }, function (node) {
              twiml.say('Please enter your 4 digit pass code');
          });
        }
        console.log("I'm inside of .then (aUserWithID) 4::", aUserWithID);
    })
    .catch(function(err){
      // just need one of these
      console.log('error:', err);
    });

  }*/
  console.log("Before response ::");
  response.send(twiml);
});

router.post('/telephonicPassCode', twilio.webhook({validate: false}), function (request, response) {
    var passCode = request.body.Digits;
    var telephonicUserID = request.query.ID;
    if (telephonicUserID.length < 4 ) {
      response.send(twiml,redirectWelcome());
    }

    console.log('passCode::', passCode);
    console.log('telephonicUserID 2::', telephonicUserID);

    var optionActions = {
        "1": getSpanishInterpreter,
        "2": getHmongInterpreter,
        "3": getSomaliInterpreter,
        "4": getOromoInterpreter,
        "5": getAmharicInterpreter
    };
    var twiml = new twilio.TwimlResponse();
    var promise = User.findOne({telephonicID: telephonicUserID}).exec();
    promise.then(function(aUserWithID) {
      console.log('aUserWithID 3::', aUserWithID);
      return aUserWithID;
    })
    .then(function(aUserWithID) {
      // do something with
      console.log('aUserWithID::', aUserWithID);
      if (aUserWithID != null && aUserWithID.telephonicPassCode == passCode) {
        console.log("I'm inside if (aUserWithID) 2::", aUserWithID);
        console.log('aUserWithID.passCode::', aUserWithID.telephonicPassCode);
        // var twiml = new twilio.TwimlResponse();
        //TODO reconsider sending userID...perhaps base64encode it
        twiml.gather({
            action: "/telephonic/menu?userID="+aUserWithID._id,
            numDigits: "1",
            method: "POST"
        }, function (node) {
          twiml.say('Please choose the language of interpretation. Spanish, 1. Hmong, 2. ');
        });
        response.send(twiml);
      }else {
        twiml.say('You entered an incorrect username or passcode.')
        response.send(redirectWelcome(twiml));
      }

    })
    .catch(function(err){
      // just need one of these
      console.log('error:', err);
    });

});

// POST: '/ivr/menu'
router.post('/menu', twilio.webhook({validate: false}), function (request, response) {
  console.log('inside /menu request.body :: ', request.body);
  var CallSid = request.body.CallSid;
    var customerUserID = request.query.userID;
    var selectedOption = request.body.Digits;
    var optionActions = {
        "1": getSpanishInterpreter,
        "2": getHmongInterpreter,
        "3": getSomaliInterpreter,
        "4": getOromoInterpreter,
        "5": getAmharicInterpreter
    };

    var teleAppCallID = shortid.generate();
    //DONE create new telephonic work item in mongodb Works_Tel collection Works_Tel
    //DONE store the shoirtid with it and the caller's userID
    //TODO first check to make sure there isn't a duplicate for shortid in DB before saving
    // "callSummary" : Object, "customer_id" : String, "contractor_id" : String, "money" : Object, "shortid" : String
    var money = {
      payable : {'test' : 'key'},
      amount : {'test' : 'key'}
    };
    var promise = new Work_Tel({taskSid: "first", inboundCallSid: CallSid, workerSid: "", inboundSummary: {}, outboundSummary: {}, customer_id: customerUserID, contractor_id: "", shortid: teleAppCallID});
    // var promise = Work_Tel.create({callSummary: {}, customer_id: '', contractor_id: "", money: {}, shortid: teleAppCallID}).exec();
    promise.save()
    .then(function(data) {
      console.log('Works_Tel item after saving ::', data);
      var twiml = new twilio.TwimlResponse();

      if (optionActions[selectedOption]) {
        twiml.say('selected '+ selectedOption +'please wait while we connect you to an interpreter.');

          var twiml = new twilio.TwimlResponse();
          optionActions[selectedOption](twiml, teleAppCallID, CallSid);
          response.send(twiml);
      }else {
        response.send(redirectWelcome());
      }
    })
    .catch(function(err){
      // just need one of these
      console.log('error in .then :', err);
    });



});

// POST: '/ivr/planets'
router.post('/callSummary', twilio.webhook({validate: false}), (req, res) => {
  console.log("req.body in /callSummary::", req.body);

  var twiml = new twilio.TwimlResponse();

  console.log('inside /callSummary req.query::', req.query);
  // console.log('inside /callSummary req.query.callShortID::', callShortID);
  // console.log('inside /callSummary req.body::', callSummaryBody);
  var callSummaryBody = req.body;


  if (callSummaryBody.QueueResult != 'bridged') {
    console.log("callSummaryBody.QueueResult != 'bridged', redirecting to another worker::");
    twiml.redirect('/telephonic/AssignmentCallbackUrl');
  }
  if (callSummaryBody.QueueResult == 'bridged') {
    console.log('inside /callSummary req.query inside bridged::', req.query);
    console.log('inside /callSummary req.body inside bridged::', req.body);
    console.log('callSummaryBody.CallSid::', callSummaryBody.CallSid);
    var callShortID = req.query.callShortID;
    var promised = Work_Tel.findOne({shortid: callShortID}).exec();
    promised.then(function(theTeleWorkWithShortID) {
      console.log('theTeleWorkWithShortID ::', theTeleWorkWithShortID);
      theTeleWorkWithShortID.inboundSummary = callSummaryBody;
      theTeleWorkWithShortID.inboundCallSidSecond = callSummaryBody.CallSid;
      // theTeleWorkWithShortID.taskSid = req.query.TaskSid;
      theTeleWorkWithShortID.save();
      return theTeleWorkWithShortID;
    })
    .then(function(theTeleWorkWithShortID) {
      // console.log('inside the then theTeleWorkWithShortID::', theTeleWorkWithShortID);
    })
    .catch(function(err){
      // just need one of these
      console.log('error:', err);
    });

  } else if (callSummaryBody.CallStatus == 'canceled'){
    //save into the db as canceled
  }else if (callSummaryBody.CallStatus == 'completed'){
    console.log('im inside else if (callSummaryBody.CallStatus == completed::');
    console.log('im inside else if (callSummaryBody.CallStatus == completed callSummaryBody::', callSummaryBody);
    var call_sid = req.query.callSid;
    var workerSid = req.query.workerSid;
    console.log('else if req.query::', req.query);
    console.log('else if call_sid::', call_sid);
    console.log('else if workerSid::', workerSid);

    // then save the duration in the database as an appointment to charge client and pay the interpreter for
    // console.log('callSummaryBody.CallDuration::', callSummaryBody.CallDuration);

    var promise = Work_Tel.findOne({inboundCallSid: call_sid}).exec();
    promise.then(function(theTeleWorkWithcall_sid) {
      console.log('after finding work assignment else if req.query::', req.query);
      console.log('after finding work assignment else if req.query.TaskSid::', req.query.TaskSid);
      console.log('theTeleWorkWithcall_sid found call item in db with call_sid to save to::', theTeleWorkWithcall_sid);
      console.log('theTeleWorkWithcall_sid found call item in db with call_sid.outboundSummary to save to::', theTeleWorkWithcall_sid.outboundSummary);

      //convert duration seconds to minutes and seconds
      console.log('callSummaryBody::', callSummaryBody);
      var durationSeconds = callSummaryBody.CallDuration;
      var secsremain = durationSeconds % 60 || 0;
      var minutes = Math.floor(durationSeconds/60);
      if (secsremain > 0) {
        roundedDurationUpInMins = minutes + 1;
      }else {
        roundedDurationUpInMins = minutes;
      }
      var roundedDurationInMins =
      console.log('Duration:: '+minutes+' min '+secsremain+'sec');
      callSummaryBody.durationObj = {minutes: minutes, seconds: secsremain, roundedDurationUpInMins: roundedDurationUpInMins}
      theTeleWorkWithcall_sid.outboundSummary = callSummaryBody;
      // theTeleWorkWithcall_sid.outboundSummary.createdAt = Date.now(); //moment().unix().toDate()
      // theTeleWorkWithcall_sid.outboundSummary.createdAt = new Date(Date.now()).toISOString(); //moment().unix().toDate()
      theTeleWorkWithcall_sid.outboundSummary.createdAt = new Date(); //moment().unix().toDate()

      theTeleWorkWithcall_sid.workerSid = workerSid;
      // theTeleWorkWithcall_sid.taskSid = req.query.TaskSid;

      theTeleWorkWithcall_sid.save();
      return theTeleWorkWithcall_sid;
    })
    .then(function(theTeleWorkWithcall_sid) {
      console.log('inside the then theTeleWorkWithcall_sid::', theTeleWorkWithcall_sid);
      //add invoiceitem to customer in stripe
      var promisesy = User.findOne({'twilioSids.workerSid': theTeleWorkWithcall_sid.workerSid}).exec();
      return promisesy.then(function(aUserWithWorkerSid) {
        console.log('aUserWithWorkerSid ::', aUserWithWorkerSid);
        console.log('aUserWithWorkerSid._id ::', aUserWithWorkerSid._id);
        theTeleWorkWithcall_sid.contractor_id = aUserWithWorkerSid._id;
        theTeleWorkWithcall_sid.save();
        var data = {};
        data.theTeleWorkWithcall_sid = theTeleWorkWithcall_sid;
        data.aUserWithWorkerSid = aUserWithWorkerSid;
        return data;
      })

    })
    .then(function(data) {
      console.log('inside the then data::', data);
      console.log('inside the then data.theTeleWorkWithcall_sid::', data.theTeleWorkWithcall_sid);

      //add invoiceitem to customer in stripe
      var promisesyo = User.findById(data.theTeleWorkWithcall_sid.customer_id).exec();
      return promisesyo.then(function(aUserWithCustomer_ID) {
        console.log('aUserWithCustomer_ID ::', aUserWithCustomer_ID);
        data.aUserWithCustomer_ID = aUserWithCustomer_ID;
        return data;
      })

    })
    .then(function(data){
      console.log('inside the then theTeleWorkWithcall_sid | ::', data.theTeleWorkWithcall_sid);
      console.log('inside the then aUserWithWorkerSid::', data.aUserWithWorkerSid);
      console.log('inside the then aUserWithCustomer_ID::', data.aUserWithCustomer_ID);
      console.log('inside the then just before stripeCharge.createStripeInvoiceItem ::');

      //CHARGE CUSTOMER
           //Add invoiceitem to customer in stripe (customer and subscription on platform account)
      /*stripeCharge.createStripeInvoiceItem(data);*/
           //Charge customer's credit card or bank account right away with stripe ~ and pay worker
             // *stripeCharge.perEvent();
           // subtract from customer's stripe balance
               //check if  balance is below limit, recharge to amount, then add invoiceitem
            stripeCharge.prePaid(data);
      //INVOICE CUSTOMER
           //Send to waveapps, or
           //Send to Payable, or
           //Do nothing. Invoice will be send at the end of the month Code Internal Process

      //PAY WORKER
        //WITH PAYABLE
        payable.postWork(data) // add this work item to the worker's Payable.com account
        //WITH STRIPE
        //(Do here)

      //2 @TODO charge customer and pay agent with stripe destination paremeter
          // stripeCharge.perEvent(data);
      //3


      // return theTeleWorkWithcall_sid;
      //reset worker to idle
      var callbody = req.body;
      var accountSid = configsty.TWILIO_ACCOUNT_SID;
      var authToken = configsty.TWILIO_AUTH_TOKEN;
      var workspaceSid = callbody.WorkspaceSid;
      var taskSid = callbody.TaskSid;
      var reservationSid = callbody.ReservationSid;
      var post_work_activity_sid = 'WAbaf024ac1c7fc5d4b9f138173ac3ca12';
      var workerSid = data.theTeleWorkWithcall_sid.workerSid;
      // console.log('worker_activity_sid before updating post_work_activity_sid::', );

      var client = new twilio.TaskRouterClient(accountSid, authToken, workspaceSid);

      client.workspace.workers(workerSid).update({
          // attributes: '{"type":"support"}'
          activitySid: post_work_activity_sid
      }, function(err, worker) {
        if (err) console.log('err updating post_work_activity_sid::', err);
          console.log('worker after updating post_work_activity_sid::', worker);
      });

      client.workspace.tasks(taskSid).update({
        assignmentStatus: 'completed',
        reason: 'call completed'
      }, function(err, task) {
        if (err) console.log('err updating post_work_activity_sid::', err);
          console.log('task after updating task to completed::', task);
      });

      return taskSid;;


    })
    .then(function(taskSid){
      //update task status at completed
      // var taskSid =
      /*
      client.workspace.tasks(taskSid).update({
        assignmentStatus: 'completed',
        reason: 'call completed'
      }).then(function(reservation) {
        console.log('return of client.workspace.tasks.create::',data);

      });
      */

    })
    .catch(function(err){
      // just need one of these
      console.log('error:', err);
    });

  }
/*
  var promise = Work_Tel.findOne({shortid: callShortID}).exec();
  promise.then(function(theTeleWorkWithShortID) {
    console.log('theTeleWorkWithShortID ::', theTeleWorkWithShortID);
    if (callSummaryBody.QueueResult == 'bridged') {

      theTeleWorkWithShortID.inboundSummary = callSummaryBody;
      //update the running call with a new callback url with shortid addedWork
      var callbody = req.body;
      var accountSid = configsty.TWILIO_ACCOUNT_SID;
      var authToken = configsty.TWILIO_AUTH_TOKEN;

      console.log('callbody.CallSid::', callbody.CallSid);
      var client = new twilio(accountSid, authToken);
      client.calls(callbody.CallSid).update({
          StatusCallback: configsty.APP_URL+'/telephonic/callSummary?callShortID='+callShortID
      }, function(err, call) {
        if (err) {
          console.log('err in client.calls.update::',err);
        }
            console.log('in client.calls(callback.CallSid).update call::', call);
          console.log('in client.calls(callback.CallSid).update after upding live call callback with querystring call.direction::', call.direction);
      });
    } else if (callSummaryBody.CallStatus == 'completed') {
      theTeleWorkWithShortID.outboundSummary = callSummaryBody;
    }
    theTeleWorkWithShortID.save();

    return theTeleWorkWithShortID;

  })
  .then(function(theTeleWorkWithShortID) {
    // console.log('inside the then theTeleWorkWithShortID::', theTeleWorkWithShortID);
  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
  });
*/

  res.header('Content-Type', 'text/xml');
  // Send the TwiML as the response.
  res.send(twiml.toString());
});

router.post('/screencall', twilio.webhook({validate: false}), function (req, res) {
  console.log('inside /screencall');
  console.log('inside /screencall req.query.reservationSid::', req.query.reservationSid);
  var reservationSid = req.query.reservationSid;
  var twiml = new twilio.TwimlResponse();
  twiml.say('Please press any key to accept this interpreting session.');
  twiml.gather({
      action: '/telephonic/connectmessage?reservationSid='+reservationSid,
      numDigits: '1'
    }, function () {
      this
        .say('Please press any key to accept this interpreting session.');
    })
    // .queue('Spanish Queue');
    .say('Sorry. Did not get your response')
    .redirect('/telephonic/screencall');
    // .hangup()

  res.send(twiml.toString());
});
// POST: /telephonic/connectmessage
router.post('/connectmessage', twilio.webhook({validate: false}), function (req, res) {
  console.log('in connectmessage req.body', req.body);
  console.log('inside /connectmessage req.query.reservationSid::', req.query.reservationSid);
  var reservationSid = req.query.reservationSid;


  var twiml = new twilio.TwimlResponse();
  // twiml.say('You will now be connected to the first caller in the queue.')

  ///*
  twiml.say('You will now be connected to the interpreting session.')
    .dial({}, function() {
        this.queue({reservationSid: ''+reservationSid});
        // this.queue({queueSid:'QU764c27d4fad6b2d3f06d9481441f1e43'});
        // this.queue('spanish');

    });
    // .redirect();
    //*/
  console.log(twiml.toString());
  res.header('Content-Type', 'application/xml');
  res.send(twiml.toString());
});

router.post('/waitmusic', function(request, response) {

    var twiml = new twilio.TwimlResponse();

    // var queuePosition = request.body.QueuePosition;
    // var waitTime = request.body.AvgQueueTime;

    // twiml.say('Hello, you are caller  ' + queuePosition + ' in line. There is an average wait time of ' + waitTime + ' .');
    twiml.say('please enjoy the music while we connect you .');
    twiml.play('http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3');

    twiml.redirect('/telephonic/waitmusic');
    // Return an XML response to this request
    response.set('Content-Type','text/xml');
    response.send(twiml.toString());

});

router.post('/getSpanishInterpreter', function(request, response) {

    var twiml = new twilio.TwimlResponse();

    twiml.say("Please continue to hold while we connect you with a Spanish interpreter",
        {voice: "alice", language: "en-GB"});
    twiml.enqueue('Spanish Queue');

    twiml.dial({ action: '/telephonic/callSummary', callerId: "+16122172551"}, function() {
          this.number('+16128121238', {
            url: '/telephonic/screencall'
          });
          // this.queue('Spanish Queue');
    });


    twiml.hangup();
    return twiml;

});

/*
router.use('/CallCenterCallback', (req, res) => {
  console.log("req.body::", req.body);
  var callbody = req.body;
  var accountSid = configsty.TWILIO_ACCOUNT_SID;
  var authToken = configsty.TWILIO_AUTH_TOKEN;
  var workspaceSid = callbody.WorkspaceSid;
  var taskSid = callbody.TaskSid;
  var reservationSid = callbody.ReservationSid;


  // var client = new twilio.TaskRouterClient(accountSid, authToken, workspaceSid);
  // // call using a reservation
  // client.workspace.tasks(taskSid).reservations(reservationSid).update({
  //     instruction: 'call',
  //     callFrom: '+16122172551',
  //     callUrl: '/telephonic/screencall',
  //     callStatusCallbackUrl: '/telephonic/callSummary',
  //     callAccept: 'true',
  //     callTo:
  // }, function(err, reservation) {
  //     console.log(reservation.reservation_status);
  //     console.log(reservation.worker_name);
  // });


});
*/


var saveLanguageToDB = function(CallSid, language){
  var promised = Work_Tel.findOne({inboundCallSid: CallSid}).exec();
  promised.then(function(theTeleWorkWithCallSid) {
    console.log('theTeleWorkWithCallSid in saveLanguageToDB function::', theTeleWorkWithCallSid);
    theTeleWorkWithCallSid.language = language;
    // theTeleWorkWithCallSid.taskSid = req.query.TaskSid;
    theTeleWorkWithCallSid.save();
    return theTeleWorkWithCallSid;
  })
  .then(function(theTeleWorkWithCallSid) {
    // Do nothing
  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
  });

}

var getSpanishInterpreter = function (twiml, teleAppCallID, CallSid) {
    saveLanguageToDB(CallSid, "spanish");
    twiml.say("TPlease hold while we connect you with a Spanish interpreter",
        {voice: "alice", language: "en-GB"});

    var arr = {selected_language:"Spanish", selected_medium:"Voice"};
    var json = JSON.stringify(arr);
    var voiceChannelSid = 'TC930839dfbc7a503a57b90e57e7a12648';
    twiml.enqueue({
      // taskChannel: 'voice',
      // taskChannelSid: 'TC930839dfbc7a503a57b90e57e7a12648',
      workflowSid:"WW2f071edf445c3e932ff733ae5013a515",
      action:"/telephonic/callSummary?callShortID="+teleAppCallID}, function(node) {
        node.task(json);
    });
    console.log("I'm right after enqueue in getSpanishInterpreter");

    // twiml.enqueue('Spanish Queue');
    // console.log("I'm right after enqueue in getSpanishInterpreter");
    // //, waitUrl: "/telephonic/waitmusic"
    // // var twiml = new twilio.TwimlResponse();
    //
    // twiml.dial({ action: '/telephonic/callSummary', callerId: "+16122172551"}, function() {
    //       this.number('+16128121238', {
    //         url: '/telephonic/screencall'
    //       });
    //
    // });


    twiml.hangup();
    return twiml;
};

var dialSpanishInterpreter = function (twiml) {
    twiml.dial({ action: '/telephonic/callSummary', callerId: "+16122172551"}, function() {
          this.number('+16128121238', {
            url: '/telephonic/screencall'
          });
          // this.queue('Spanish Queue');
    });
    twiml.say('Your conference call is starting.',
    {
        voice:'woman',
        language:'en-gb'
    })
    .dial({
            action:'/telephonic/callSummary', callerId: "+16122172551"
        }, function() {
            this.conference('waitingRoom', {
            beep:'false',
            url: '/telephonic/screencall'
        });
    });
    twiml.hangup();
    return twiml;
};
var getHmongInterpreter = function (twiml) {
    twiml.say("Please hold while we connect you with a Hmong interpreter",
        {voice: "alice", language: "en-GB"});
    twiml.dial({ action: '/phoneAnInterpreter?agentId=' + '123' }, function() {
          this.number('+16128121238'
        );
    });

    twiml.say("Thank you for calling NowLanguage TeleInterpret Service - the " +
        "world's best choice for language interpreting services.");

    twiml.hangup();
    return twiml;
};
var getSomaliInterpreter = function (twiml) {
    twiml.say("Please hold while we connect you with a Somali interpreter",
        {voice: "alice", language: "en-GB"});
    twiml.dial({ action: '/phoneAnInterpreter?agentId=' + '123' }, function() {
          this.number('+16128121238'
        );
    });

    twiml.say("Thank you for calling NowLanguage TeleInterpret Service - the " +
        "world's best choice for language interpreting services.");

    twiml.hangup();
    return twiml;
};
var getOromoInterpreter = function (twiml) {
    twiml.say("Please hold while we connect you with an Oromo interpreter",
        {voice: "alice", language: "en-GB"});
    twiml.dial({ action: '/phoneAnInterpreter?agentId=' + '123' }, function() {
          this.number('+16128121238'
        );
    });

    twiml.say("Thank you for calling NowLanguage TeleInterpret Service - the " +
        "world's best choice for language interpreting services.");

    twiml.hangup();
    return twiml;
};
var getAmharicInterpreter = function (twiml) {
    twiml.say("Please hold while we connect you with an Amharic interpreter",
        {voice: "alice", language: "en-GB"});
    twiml.dial({ action: '/phoneAnInterpreter?agentId=' + '123' }, function() {
          this.number('+16128121238'
        );
    });

    twiml.say("Thank you for calling NowLanguage TeleInterpret Service - the " +
        "world's best choice for language interpreting services.");

    twiml.hangup();
    return twiml;
};

var listPlanets = function (twiml) {
    twiml.gather({
        action: "/telephonic/planets",
        numDigits: "1",
        method: "POST"
    }, function (node) {
        node.say("To call the planet Broh doe As O G, press 2. To call the planet " +
            "DuhGo bah, press 3. To call an oober asteroid to your location, press 4. To " +
            "go back to the main menu, press the star key ",
            {voice: "alice", language: "en-GB", loop: 3});
    });
    return twiml;
};

var redirectWelcome = function (twiml) {
  if (twiml) {

  } else {
    var twiml = new twilio.TwimlResponse();
  }
    twiml.say("Returning to the main menu", {voice: "alice", language: "en-GB"});
    twiml.redirect("/telephonic/welcome");
    return twiml;
};
//https://www.twilio.com/docs/tutorials/walkthrough/ivr-phone-tree/node/express#6




module.exports = router;
