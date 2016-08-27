var express = require('express');
var router = express.Router();
var twilio = require('twilio');

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

var shortid = require('shortid');

router.post('/CallCenterCallback', twilio.webhook({validate: false}), (req, res) => {
  //twilio@3.3.1-edge
  console.log("req.body in router.post CallCenterCallback::", req.body);
  // var callbody = req.body;
});

router.use('/AssignmentCallbackUrl', twilio.webhook({validate: false}), (req, res) => {
  //twilio@3.3.1-edge
  console.log("req.query in app.post AssignmentCallbackUrl::", req.query);
  console.log("req.body in app.post AssignmentCallbackUrl::", req.body);
  var callbody = req.body;
  var accountSid = process.env.TWILIO_ACCOUNT_SID;
  var authToken = process.env.TWILIO_AUTH_TOKEN;
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
    url: process.env.APP_URL+'/telephonic/screencall?reservationSid='+reservationSid,
    status_callback_url: process.env.APP_URL+'/telephonic/callSummary?callSid='+call_sid+'&workerSid='+callbody.WorkerSid,
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
    }).redirect('/telephonic/welcome');
    response.send(twiml);
});

// POST: '/ivr/menu'
router.post('/telephonicUserID', twilio.webhook({validate: false}), function (request, response) {
    var telephonicUserID = request.body.Digits;
    console.log('telephonicUserID::', telephonicUserID);
    var twiml = new twilio.TwimlResponse();
    var promise = User.findOne({telephonicID: telephonicUserID}).exec();
    promise.then(function(aUserWithID) {
      console.log('aUserWithID ::', aUserWithID);
      // if (anyUserWithID == null){
      //   addTelephonicIDnPassCode();
      // }
      return aUserWithID;

    })
    .then(function(aUserWithID) {
      // do something with
      if (aUserWithID.telephonicID == telephonicUserID) {
        console.log("I'm inside if (aUserWithID) ::", aUserWithID);
        // var twiml = new twilio.TwimlResponse();
        twiml.gather({
            action: "/telephonic/telephonicPassCode?ID=" + telephonicUserID,
            numDigits: "4",
            method: "POST"
        }, function (node) {
            twiml.say('Please enter your 4 digit pass code');
        });
        response.send(twiml);
      }else {
        response.send(redirectWelcome());
      }

    })
    .catch(function(err){
      // just need one of these
      console.log('error:', err);
    });

});

router.post('/telephonicPassCode', twilio.webhook({validate: false}), function (request, response) {
    var passCode = request.body.Digits;
    var telephonicUserID = request.query.ID;

    console.log('passCode::', passCode);
    console.log('telephonicUserID::', telephonicUserID);

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
      console.log('aUserWithID ::', aUserWithID);
      return aUserWithID;
    })
    .then(function(aUserWithID) {
      // do something with
      console.log('aUserWithID.passCode::', aUserWithID.telephonicPassCode);
      if (aUserWithID.telephonicPassCode == passCode) {
        console.log("I'm inside if (aUserWithID) ::", aUserWithID);
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
        response.send(redirectWelcome());
      }

    })
    .catch(function(err){
      // just need one of these
      console.log('error:', err);
    });

});

// POST: '/ivr/menu'
router.post('/menu', twilio.webhook({validate: false}), function (request, response) {
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
    var promise = new Work_Tel({workerSid: "", inboundSummary: {}, outboundSummary: {}, customer_id: customerUserID, contractor_id: "", money: {}, shortid: teleAppCallID});
    // var promise = Work_Tel.create({callSummary: {}, customer_id: '', contractor_id: "", money: {}, shortid: teleAppCallID}).exec();
    promise.save()
    .then(function(data) {
      console.log('Works_Tel item after saving ::', data);
      var twiml = new twilio.TwimlResponse();

      if (optionActions[selectedOption]) {
        twiml.say('selected '+ selectedOption +'please wait while we connect you to an interpreter.');

          var twiml = new twilio.TwimlResponse();
          optionActions[selectedOption](twiml, teleAppCallID);
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
  var callSummaryBody = req.body;
  var twiml = new twilio.TwimlResponse();
  var callShortID = req.query.callShortID;
  console.log('inside /callSummary req.query::', req.query);
  // console.log('inside /callSummary req.query.callShortID::', callShortID);
  // console.log('inside /callSummary req.body::', callSummaryBody);
  var call_sid = req.query.call_sid;
  var workerSid = req.query.workerSid;


  if (callSummaryBody.QueueResult == 'bridged') {
    var promise = Work_Tel.findOne({shortid: callShortID}).exec();
    promise.then(function(theTeleWorkWithShortID) {
      console.log('theTeleWorkWithShortID ::', theTeleWorkWithShortID);
      theTeleWorkWithShortID.inboundSummary = callSummaryBody;
      theTeleWorkWithShortID.inboundCallSid = callSummaryBody.CallSid;
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

  } else if (callSummaryBody.CallStatus == 'completed'){
    console.log('im inside else if (callSummaryBody.CallStatus == completed::');
    // then save the duration in the database as an appointment to charge client and pay the interpreter for
    // console.log('callSummaryBody.CallDuration::', callSummaryBody.CallDuration);
    var promise = Work_Tel.findOne({inboundCallSid: call_sid}).exec();
    promise.then(function(theTeleWorkWithShortID) {
      console.log('theTeleWorkWithShortID found call item in db with call_sid to save to::', theTeleWorkWithShortID);
      theTeleWorkWithShortID.outboundSummary = callSummaryBody;
      theTeleWorkWithShortID.workerSid = workerSid;

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
  }
/*
  var promise = Work_Tel.findOne({shortid: callShortID}).exec();
  promise.then(function(theTeleWorkWithShortID) {
    console.log('theTeleWorkWithShortID ::', theTeleWorkWithShortID);
    if (callSummaryBody.QueueResult == 'bridged') {

      theTeleWorkWithShortID.inboundSummary = callSummaryBody;
      //update the running call with a new callback url with shortid addedWork
      var callbody = req.body;
      var accountSid = process.env.TWILIO_ACCOUNT_SID;
      var authToken = process.env.TWILIO_AUTH_TOKEN;

      console.log('callbody.CallSid::', callbody.CallSid);
      var client = new twilio(accountSid, authToken);
      client.calls(callbody.CallSid).update({
          StatusCallback: process.env.APP_URL+'/telephonic/callSummary?callShortID='+callShortID
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

router.use('/CallCenterCallback', (req, res) => {
  console.log("req.body::", req.body);
  var callbody = req.body;
  var accountSid = process.env.TWILIO_ACCOUNT_SID;
  var authToken = process.env.TWILIO_AUTH_TOKEN;
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

var getSpanishInterpreter = function (twiml, teleAppCallID) {
    twiml.say("Please hold while we connect you with a Spanish interpreter",
        {voice: "alice", language: "en-GB"});

    var arr = {selected_language:"Spanish"};
    var json = JSON.stringify(arr);

    twiml.enqueue({workflowSid:"WW2f071edf445c3e932ff733ae5013a515", action:"/telephonic/callSummary?callShortID="+teleAppCallID}, function(node) {
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

var redirectWelcome = function () {
    var twiml = new twilio.TwimlResponse();
    twiml.say("Returning to the main menu", {voice: "alice", language: "en-GB"});
    twiml.redirect("/telephonic/welcome");
    return twiml;
};
//https://www.twilio.com/docs/tutorials/walkthrough/ivr-phone-tree/node/express#6


module.exports = router;
