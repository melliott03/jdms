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

var zipcode_to_timezone = require( 'zipcode-to-timezone' );

// var Work_Tel = mongoose.model('Work_Tel');
Promise.promisifyAll(Work_Tel);
Promise.promisifyAll(Work_Tel.prototype);

var moment = require('moment');

var shortid = require('shortid');

var stripeCharge = require('../modules/stripeCharge');

var payable = require('../modules/payable');

var uniqueRandom = require('unique-random');

var Rx = require('rx');

var accountSid = configsty.TWILIO_ACCOUNT_SID;
var authToken = configsty.TWILIO_AUTH_TOKEN;
var workspaceSid = configsty.TWILIO_WORKSPACE_SID;
var videoWorkflowSid = configsty.TWILIO_VIDEO_WORKFLOW_SID;
var videoChannelSid = 'TC2eae701e12864f7382abbe99d53ecacf';


var client = new twilio.TaskRouterClient(accountSid, authToken, workspaceSid);

var passport = require('passport');

// app.post('/testExpressSocket', passport.authenticate('jwt', { session: false }), function(req, res, next) {

router.post('/callRequest', passport.authenticate('jwt', { session: false }), twilio.webhook({validate: false}), function (req, res) {
  console.log('inside /callRequest');
  console.log('inside /callRequest req.body::', req.body);
  console.log('inside /callRequest req.user::', req.user);
  console.log('inside /callRequest req.user.phone::', req.user.phone);

  var rand = uniqueRandom(100000, 999999);
  var bookingid = rand();

  bookingid = ""+bookingid;
  console.log('bookingid after math.random::', bookingid);
  var language = req.body.language;
  console.log('language::', language);
  var arr = {selected_language: language, selected_medium:"Voice", bookingid: bookingid};
  var json = JSON.stringify(arr);
  var voiceWorkflowSid = "WW2f071edf445c3e932ff733ae5013a515";

  //. SAVE WORK_TEL INTO DB
  //@TODO create work_tel
  //@TODO save customer_id to work_tel
  //@TODO save bookingid to work_tel

  var teleAppCallID = shortid.generate();

  //. CREATE TASK
  client.workspace.tasks.create({
    workflowSid: voiceWorkflowSid,
    attributes: json
  }).then(function(data) {
    console.log(' in .then of create task, data ::', data);

    var money = {
      payable : {'test' : 'key'},
      amount : {'test' : 'key'}
    };
    var customerUserID = req.user._id;

    var promise = new Work_Tel({taskSid: data.sid, inboundCallSid: "", workerSid: "", inboundSummary: {}, outboundSummary: {}, customer_id: customerUserID, contractor_id: "", bookingid: bookingid, language: language, shortid: teleAppCallID});
    // var promise = Work_Tel.create({callSummary: {}, customer_id: '', contractor_id: "", money: {}, shortid: teleAppCallID}).exec();
    promise.save()
    .then(function(data) {
      console.log('Works_Tel item after saving with bookingid ::', data);
      var twiml = new twilio.TwimlResponse();

      if (data) {
        res.send(data);
      }else {
        res.sendStatus(500);
      }
    })
    .catch(function(err){
      // just need one of these
      console.log('error in .then :', err);
    });


  }).catch(function(err){
    // just need one of these
    console.log(' in .catch of create task, err ::', err);
  });;
  //. RESERVE A WORKER
  //. GIVE CUSTOMER A CALL-IN-CODE
  //. GIVE WORKER A CALL-IN-CODE
  //. CALL CUSTOMER PUT THEM IN CONFERENCE CALL
  //. CALL WORKER PUT THEM IN CONFERENCE CALL




});


router.post('/CallCenterCallback', twilio.webhook({validate: false}), (req, res) => {
  //twilio@3.3.1-edge
  console.log("req.body in router.post CallCenterCallback::", req.body);
  // var callbody = req.body;
  var workerSid = req.body.WorkerSid;
  if (req.body.EventType == 'worker.activity.update'){
    var data = {};
    if (req.body.WorkerActivityName === 'Idle') {
      data.num = 1;
    } else {
      data.num = 0;
    }
    var WorkerAttributes = JSON.parse(req.body.WorkerAttributes);
    console.log('WorkerAttributes::', WorkerAttributes);
    var workerLanguageArray = WorkerAttributes.languages;
    console.log('workerLanguageArray::', workerLanguageArray);

    workerLanguageArray.map(function(language){
      console.log('language::', language);
      console.log('language::', typeof language);
      // language = ''+language;
      // console.log('language 2::', typeof language);
      // res.io.to(contractorSocketArray[0].socketID).emit('socketToYou', JSON.stringify(savedWork._id));
      // console.log('res.io.emit::', res.io.emit);
      // console.log('res.io::', res.io);
      // console.log('res::', res);

      res.io.emit(language, data);
    });

    /*
    var source = Rx.Observable.create(observer => {
    // Yield a single value and complete
    observer.onNext(42);
    observer.onCompleted();

    // Any cleanup logic might go here
    return () => console.log('disposed')
  });

  */
}

if (req.body.EventType == 'reservation.accepted' && req.body.TaskSid && req.body.WorkflowName == 'VideoWorkflow') {
  console.log('Im inside the eventtype = reservation.accepted req.body.WorkflowName == VideoWorkflow, telephonic/CallCenterCallback req.body::', req.body);




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
    console.log("in req.body.EventType == 'reservation.accepted' && req.body.TaskSid aUserWithWorkerSid | ::", aUserWithWorkerSid);
    return aUserWithWorkerSid;
  })
  .then(function(aUserWithWorkerSid) {
    // res.sendStatus(200);
  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
  });
}else {
  // res.sendStatus(200);
  // res.status(200);
  // res.status(200).send('Everything is Awesome!');

}
res.sendStatus(200); // equivalent to res.status(200).send('OK')

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
  var bookingid = str.bookingid;
  var assignmentInstruction = {
    instruction: 'call',
    // post_work_activity_sid: 'WA442ed2a8dcf0fa1b169207b8cd80dbab',
    url: configsty.APP_URL+'/telephonic/screencall?reservationSid='+reservationSid+'&bookingid='+bookingid,
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
    action: "/telephonic/hasBookingID",
    numDigits: "1",
    method: "POST"
  }, function (node) {
    twiml.say("If you have a reservation press 1, If not, press 2");

    // twiml.say('Please choose the language of interpretation. Spanish, 1. Hmong, 2. Somali, 3. Oromo, 4. Amharic, 5.');

    // node.play("http://howtodocs.s3.amazonaws.com/et-phone.mp3", {loop: 3});
  }); //.redirect('/telephonic/welcome');
  response.send(twiml);
});

router.post('/hasBookingID', twilio.webhook({validate: false}), function (request, response) {
  var twiml = new twilio.TwimlResponse();

  var bookingidVSchooseLang = request.body.Digits;
  if (bookingidVSchooseLang.length != 1 ) {
    console.log('bookingidVSchooseLang.length::', bookingidVSchooseLang.length);
    // twiml.say('Your User ID must be 7 degits. Please try again.');
    twiml.redirect('/telephonic/welcome');
  }else if (bookingidVSchooseLang == 1 ){
    twiml.gather({
      action: "/telephonic/enteredBookingID", //?ID=' + telephonicUserID
      numDigits: "6",
      method: "POST"
    }, function (node) {
      twiml.say('Please enter your reservation I D');
    });
  }else if (bookingidVSchooseLang == 2 ){
    twiml.redirect('/telephonic/welcome_chooseLang');
  }

console.log("Before response ::");
response.send(twiml);
});

router.post('/enteredBookingID', twilio.webhook({validate: false}), function (req, res) {
  console.log('in /enteredBookingID req.body::', req.body);
  console.log('in /enteredBookingID req.query::', req.query);


  var twiml = new twilio.TwimlResponse();
  var bookingid = req.body.Digits;
  var conferenceName = bookingid;
  // var telephonicUserID = request.query.ID;
  console.log('bookingid::', bookingid);
  if (bookingid.length != 6 ) {
    response.send(twiml,redirectWelcome());
  }
  //FINDOUT IF THEIR CONFERENCE EXISTS
  var client = require('twilio')(accountSid, authToken);
  client.conferences.list(
    { status: "in-progress",
      friendlyName: bookingid }
    ).then(function(data) {
        if (data) {
          console.log('client.conferences.list data::', data);
          console.log('client.conferences.list data.conferences::', data.conferences);
          if (data.conferences.length > 0 ) {
            //CONFERENCE EXISTS, PUT THEM INTO CONFERENCE CALL WHERE THE INTERPREER IS WAITING
            twiml.say('You are being connected to the interpreter.');
            twiml.dial(function(node) {
              node.conference(conferenceName, {
                startConferenceOnEnter: true
              });
            });
            return saveInboundSummary(req);

          } else {
            console.log('data.conferences.length is not greater than 0::', data);
            twiml.say('The conference does not exist or is no longer active. Please enter a different reservation I D');
            twiml.redirect('/telephonic/reenteringhasBookingID');
            return;
          }
          // data.conferences.forEach(function(conference) {
          //     console.log('conference::', conference);
          //     console.log('conference.Status::', conference.status);
          //   });
        }else {
          console.log('in client.conferences.list, NO DATA!');
          return;
        }

      })
      .then(function(data){
        console.log(twiml.toString());
        res.header('Content-Type', 'application/xml');
        res.send(twiml.toString());
      }).catch(function(err){
        // just need one of these
        console.log('error in client.conferences.list::', err);
      });


  var saveInboundSummary = function(req){
    console.log('in saveInboundSummary::');
    var callSummaryBody = req.body; //@TODO save as inboundSummary
    //@TODO find work_tel and save inboundSummary
    console.log('in saveInboundSummary, callSummaryBody::', callSummaryBody);

    var callShortID = req.query.callShortID;
    var promised = Work_Tel.findOne({bookingid: bookingid}).exec();
    return promised.then(function(theTeleWorkWithShortID) {
      console.log('in saveInboundSummary theTeleWorkWithShortID ::', theTeleWorkWithShortID);
      theTeleWorkWithShortID.inboundSummary = callSummaryBody;
      theTeleWorkWithShortID.inboundSummary.From2 = callSummaryBody.From.replace('+', '');
      theTeleWorkWithShortID.inboundCallSidSecond = callSummaryBody.CallSid;
      // theTeleWorkWithShortID.taskSid = req.query.TaskSid;
      // theTeleWorkWithShortID.markModified('inboundSummary');
      theTeleWorkWithShortID.save();
      return theTeleWorkWithShortID;
    })
    .then(function(theTeleWorkWithShortID) {
      // console.log('inside the then theTeleWorkWithShortID::', theTeleWorkWithShortID);
      return;
    })
    .catch(function(err){
      // just need one of these
      console.log(' saveInboundSummary error:', err);
    });
  }

});

router.post('/reenteringhasBookingID', twilio.webhook({validate: false}), function (request, response) {
  var twiml = new twilio.TwimlResponse();

    twiml.gather({
      action: "/telephonic/enteredBookingID", //?ID=' + telephonicUserID
      numDigits: "6",
      method: "POST"
    }, function (node) {
      // twiml.say('Please enter your reservation I D');
    });

  console.log("Before response ::");
  response.send(twiml);
});

router.post('/welcome_chooseLang', twilio.webhook({validate: false}), function (request, response) {
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
      console.log('inside if (aUserWithID != null && aUserWithID.telephonicPassCode == passCode)::', aUserWithID);

      if (aUserWithID.accountSuspension.suspended == true) {
        twiml.say('Your account is currently suspended. Please add funds to get back to making interpretation calls.')
        response.send(redirectWelcome(twiml));
      }else {
        console.log("I'm inside if (aUserWithID) 2::", aUserWithID);
        console.log('aUserWithID.passCode::', aUserWithID.telephonicPassCode);
        // var twiml = new twilio.TwimlResponse();
        //TODO reconsider sending userID...perhaps base64encode it
        twiml.gather({
          action: "/telephonic/menu?userID="+aUserWithID._id,
          numDigits: "1",
          method: "POST"
        }, function (node) {
          twiml.say('Please choose the language of interpretation. Spanish, 1. Hmong, 2. French, 3.');
        });
        response.send(twiml);
      }

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
    "3": getFrenchInterpreter, //        "3": getSomaliInterpreter,
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

  //@TODO

  var twiml = new twilio.TwimlResponse();

  console.log('inside /callSummary req.query::', req.query); //@TODO USE THIS TO SAVE workerSid TO Work_Tel item
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
      theTeleWorkWithShortID.inboundSummary.From2 = callSummaryBody.From.replace('+', '');
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
    var taskSid = req.query.TaskSid;
    console.log('else if req.query::', req.query);
    console.log('else if call_sid::', call_sid);
    console.log('else if taskSid::', taskSid);
    console.log('else if workerSid::', workerSid);
    var query;
    if (call_sid != "undefined") {
      query = {inboundCallSid: call_sid};
    } else if (taskSid) {
      query = {taskSid: taskSid};
    }
    console.log('query::', query);

    // then save the duration in the database as an appointment to charge client and pay the interpreter for
    // console.log('callSummaryBody.CallDuration::', callSummaryBody.CallDuration);

    var promise = Work_Tel.findOne(query).exec();
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
      // var roundedDurationInMins =
      console.log('Duration:: '+minutes+' min '+secsremain+'sec');
      callSummaryBody.durationObj = {minutes: minutes, seconds: secsremain, roundedDurationUpInMins: roundedDurationUpInMins}
      theTeleWorkWithcall_sid.outboundSummary = callSummaryBody;
      // theTeleWorkWithcall_sid.outboundSummary.createdAt = Date.now(); //moment().unix().toDate()
      // theTeleWorkWithcall_sid.outboundSummary.createdAt = new Date(Date.now()).toISOString(); //moment().unix().toDate()
      var timeZone = zipcode_to_timezone.lookup(theTeleWorkWithcall_sid.outboundSummary.CalledZip);
      console.log('timeZone::',timeZone);

      var timeNow = new Date();
      console.log('timeNow::',timeNow);

      var createdAt = moment(timeNow);
      console.log('createdAt 1::',createdAt);

      createdAt = createdAt.tz(timeZone);
      console.log('createdAt 2::',createdAt);

      var timeZoneForSaving = createdAt.tz(timeZone).format('z');
      console.log('timeZoneForSaving 2::',timeZoneForSaving);

      createdAt = createdAt.toDate();
      console.log('createdAt 3::',createdAt);

      theTeleWorkWithcall_sid.outboundSummary.createdAt = createdAt;  //moment().unix().toDate()
      theTeleWorkWithcall_sid.outboundSummary.createdAtTZ = timeZoneForSaving;  //moment().unix().toDate()

      // var humanDate = moment(theTeleWorkWithcall_sid.outboundSummary.createdAt).format("MMM DD, YYYY");
      // var humanTime = moment(theTeleWorkWithcall_sid.outboundSummary.createdAt).format("h:mm a");
      var humanDate = moment(callSummaryBody.Timestamp).format("MMM DD, YYYY");
      var humanTime = moment(callSummaryBody.Timestamp).format("h:mm a");
      console.log('humanDate::', humanDate);
      console.log('humanTime::', humanTime);

      callSummaryBody.creationDateObj = {humanDate:humanDate, humanTime:humanTime};

      theTeleWorkWithcall_sid.workerSid = workerSid;
      // theTeleWorkWithcall_sid.taskSid = req.query.TaskSid;

      theTeleWorkWithcall_sid.save(function (err, theTeleWorkWithcall_sid, numAffected) {
        if (err) {
          console.log('theTeleWorkWithcall_sid.save err ::', err);
        }
        if (theTeleWorkWithcall_sid) {
          console.log('theTeleWorkWithcall_sid::', theTeleWorkWithcall_sid);
          console.log('numAffected::', numAffected);
        }
      })
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

        console.log('aUserWithCustomer_ID.socketID::', aUserWithCustomer_ID.socketID);
        var socketsids = aUserWithCustomer_ID.socketID;
        var obj = data.theTeleWorkWithcall_sid;
        console.log('before if statement to send to socket, obj::', obj);
        if (obj.inboundSummary && obj.outboundSummary) { // && obj.money && obj.money.customerCost //(money not yet in the db)   && obj.outboundSummary.createdAt
          console.log('about to send to socket, obj::', obj);
          socketsids.forEach(function(socketid){
            if(res.io.sockets.sockets[socketid]!=undefined){
              res.io.to(socketid).emit('newTelWorkForSocket', obj)
            }else{
              console.log("Socket not connected");
            }
          });
        }
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
      //INVOICE CUSTOMER
      //Send to waveapps, or
      //Send to Payable, or
      //Do nothing. Invoice will be send at the end of the month Code Internal Process

      //PAY WORKER
      //WITH PAYABLE
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
      var workspaceSid = configsty.TWILIO_WORKSPACE_SID;
      var taskSid = callbody.TaskSid;
      var reservationSid = callbody.ReservationSid;
      var post_work_activity_sid = 'WAbaf024ac1c7fc5d4b9f138173ac3ca12';
      var workerSid = data.theTeleWorkWithcall_sid.workerSid;
      // console.log('worker_activity_sid before updating post_work_activity_sid::', );
      console.log('taskSid before marking as complete::', taskSid);
      console.log('taskSid before marking as complete::', taskSid);
      if (taskSid != 'undefined') {
        // do nothing
      }else {
        taskSid = data.theTeleWorkWithcall_sid.taskSid;
      }
      console.log('accountSid, authToken, workspaceSid::',accountSid, authToken, workspaceSid);
      var client = new twilio.TaskRouterClient(accountSid, authToken, workspaceSid);

      console.log('just before client.workspace.workers(workerSid).update');
      client.workspace.workers(workerSid).update({
        activitySid: post_work_activity_sid
      }, function(err, worker) {
        if (err) console.log('err updating post_work_activity_sid::', err);
        console.log('worker after updating post_work_activity_sid::', worker);
      });

      console.log('just before client.workspace.tasks(taskSid).update');
      client.workspace.tasks(taskSid).update({
        assignmentStatus: 'completed',
        reason: 'call completed'
      }, function(err, task) {
        if (err) console.log('err updating task to completed::', err);
        console.log('task after updating task to completed::', task);
      });

      stripeCharge.prePaid(data);
      payable.postWork(data); // add this work item to the worker's Payable.com account


      return data;


    })
    .then(function(data){
      console.log('inside the then theTeleWorkWithcall_sid |  2nd::', data.theTeleWorkWithcall_sid);
      console.log('inside the then aUserWithWorkerSid 2nd::', data.aUserWithWorkerSid);
      console.log('inside the then aUserWithCustomer_ID 2nd::', data.aUserWithCustomer_ID);
      console.log('inside the then just before stripeCharge.createStripeInvoiceItem  2nd::');

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
  console.log('inside /screencall req.query::', req.query);
  console.log('inside /screencall req.query.reservationSid::', req.query.reservationSid);
  var reservationSid = req.query.reservationSid;
  var bookingid = req.query.bookingid;
  console.log('in screencall bookingid::', bookingid);
  console.log('in screencall reservationSid::', reservationSid);

  var twiml = new twilio.TwimlResponse();
  twiml.say('Please press any key to accept this interpreting session.');
  twiml.gather({
    action: '/telephonic/connectmessage?reservationSid='+reservationSid+'&bookingid='+bookingid,
    numDigits: '1'
  }, function () {
    this
    .say('Please press any key to accept this interpreting session.');
  })
  // .queue('Spanish Queue');
  .say('Sorry. Did not get your response')
  .redirect('/telephonic/screencall?reservationSid='+reservationSid+'&bookingid='+bookingid);
  // .hangup()

  res.send(twiml.toString());
});
// POST: /telephonic/connectmessage
router.post('/connectmessage', twilio.webhook({validate: false}), function (req, res) {
  console.log('in connectmessage req.body', req.body); // @TODO save call to interpreter summary to work_tel
  console.log('inside /connectmessage req.query.reservationSid::', req.query.reservationSid);
  var reservationSid = req.query.reservationSid;
  var bookingid = req.query.bookingid;
  var conferenceName = bookingid;

  var twiml = new twilio.TwimlResponse();
  // twiml.say('You will now be connected to the first caller in the queue.')

  ///*
  if (req.query.reservationSid) { //if someone calls in without bookinng on the website
    twiml.say('You will now be connected to the interpreting session.')
    .dial({}, function() {
      this.queue({reservationSid: ''+reservationSid});
      // this.queue({queueSid:'QU764c27d4fad6b2d3f06d9481441f1e43'});
      // this.queue('spanish');
    });
  }

  //*/

  if (req.query.bookingid) {
    twiml.say('You are connecting to the conference.')
    twiml.dial(function(node) {
      node.conference(conferenceName, {
        startConferenceOnEnter: false
      });
    });
  }

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

var getReservedInterpreter = function (twiml, teleAppCallID, CallSid) {
  saveLanguageToDB(CallSid, "Spanish");
  twiml.say("Please hold while we connect you with a Spanish interpreter",
  {voice: "alice", language: "en-GB"});
  var arr = {bookingID:"Spanish", selected_medium:"Voice"};
  var json = JSON.stringify(arr);
  var voiceChannelSid = 'TC930839dfbc7a503a57b90e57e7a12648';
  twiml.enqueue({
    workflowSid:"WW2f071edf445c3e932ff733ae5013a515",
    action:"/telephonic/callSummary?callShortID="+teleAppCallID}, function(node) {
      node.task(json);
    });
    console.log("I'm right after enqueue in getSpanishInterpreter");
    twiml.hangup();
    return twiml;
  };

var getSpanishInterpreter = function (twiml, teleAppCallID, CallSid) {
  saveLanguageToDB(CallSid, "Spanish");
  twiml.say("Please hold while we connect you with a Spanish interpreter",
  {voice: "alice", language: "en-GB"});
  var arr = {selected_language:"Spanish", selected_medium:"Voice"};
  var json = JSON.stringify(arr);
  var voiceChannelSid = 'TC930839dfbc7a503a57b90e57e7a12648';
  twiml.enqueue({
    workflowSid:"WW2f071edf445c3e932ff733ae5013a515",
    action:"/telephonic/callSummary?callShortID="+teleAppCallID}, function(node) {
      node.task(json);
    });
    console.log("I'm right after enqueue in getSpanishInterpreter");
    twiml.hangup();
    return twiml;
  };
  var getFrenchInterpreter = function (twiml, teleAppCallID, CallSid) {
    saveLanguageToDB(CallSid, "French");
    twiml.say("Please hold while we connect you with a French interpreter",
    {voice: "alice", language: "en-GB"});
    var arr = {selected_language:"French", selected_medium:"Voice"};
    var json = JSON.stringify(arr);
    var voiceChannelSid = 'TC930839dfbc7a503a57b90e57e7a12648';
    twiml.enqueue({
      workflowSid:"WW2f071edf445c3e932ff733ae5013a515",
      action:"/telephonic/callSummary?callShortID="+teleAppCallID}, function(node) {
        node.task(json);
      });
      console.log("I'm right after enqueue in getFrenchInterpreter");
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
