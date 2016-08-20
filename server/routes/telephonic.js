var express = require('express');
var router = express.Router();
var twilio = require('twilio');

var mongoose = require("mongoose");
var Promise = require('bluebird');
// set Promise provider to bluebird
mongoose.Promise = require('bluebird');
var User = require('../models/user');
var Work = require('../models/work');

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
    });
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


    // if (passCode == '1234') {
    //   console.log("I'm inside if (passCode == '1234') ::", passCode);
    //   twiml.gather({
    //       action: "/telephonic/menu",
    //       numDigits: "1",
    //       method: "POST"
    //   }, function (node) {
    //     twiml.say('Please choose the language of interpretation. Spanish, 1. Hmong, 2. Somali, 3. Oromo, 4. Amharic, 5.');
    //   });
    //   response.send(twiml);
    // }

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
      console.log('aUserWithID.passCode::', aUserWithID.telephonicPassCode);
      if (aUserWithID.telephonicPassCode == passCode) {
        console.log("I'm inside if (aUserWithID) ::", aUserWithID);
        // var twiml = new twilio.TwimlResponse();
        twiml.gather({
            action: "/telephonic/menu",
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
    var selectedOption = request.body.Digits;
    var optionActions = {
        "1": getSpanishInterpreter,
        "2": getHmongInterpreter,
        "3": getSomaliInterpreter,
        "4": getOromoInterpreter,
        "5": getAmharicInterpreter

    };
    var twiml = new twilio.TwimlResponse();

    if (optionActions[selectedOption]) {
      twiml.say('selected '+ selectedOption +'please wait while we connect you to an interpreter.');

        var twiml = new twilio.TwimlResponse();
        optionActions[selectedOption](twiml);
        response.send(twiml);
    }
    response.send(redirectWelcome());
});

// POST: '/ivr/planets'
router.post('/callSummary', (req, res) => {
  console.log("req.body::", req.body);

  var DialCallStatus = req.body.DialCallStatus;
  var callDuration = req.body.DialCallDuration;

  if (DialCallStatus) {
    console.log("DialCallStatus::", DialCallStatus);
    console.log("callDuration::", callDuration);
  }

  var twiml = new twilio.TwimlResponse();
  if (DialCallStatus === 'no-answer') {
    //no-answer
    twiml.redirect('/telephonic/getSpanishInterpreter');
  } else {
    twiml.say("Thank you for using NowLanguage TeleInterpret Service - the " +
        "please come again.");
    }


  // Set the response type as XML.
  res.header('Content-Type', 'text/xml');
  // Send the TwiML as the response.
  res.send(twiml.toString());
});

router.post('/screencall', twilio.webhook({validate: false}), function (req, res) {
  console.log('inside /screencall');
  var twiml = new twilio.TwimlResponse();
  twiml.gather({
      action: '/telephonic/connectmessage',
      numDigits: '1'
    }, function () {
      this
        .say('Please press any key to accept this interpreting session.');
    });
    // .queue('Spanish Queue');
    // .say('Sorry. Did not get your response')
    // .redirect('/telephonic/getSpanishInterpreter');
    // .hangup();

  res.send(twiml.toString());
});
// POST: /telephonic/connectmessage
router.post('/connectmessage', twilio.webhook({validate: false}), function (req, res) {
  var twiml = new twilio.TwimlResponse();

  twiml.say('Connecting you to the client now');

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

var getSpanishInterpreter = function (twiml) {
    twiml.say("Please hold while we connect you with a Spanish interpreter",
        {voice: "alice", language: "en-GB"});

    var arr = {selected_language:"es"};
    var json = JSON.stringify(arr);

    twiml.enqueue({workflowSid:"WW2f071edf445c3e932ff733ae5013a515", action:"/telephonic/callSummary"}, function(node) {
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
