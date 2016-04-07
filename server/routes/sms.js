var express = require("express");
var app = express();
var router = express.Router();
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Forecast = require('forecast');//not using
var darksky = require('darksky');//not using
var geocoder = require('geocoder');
var restler = require('restler');
var sugar = require('sugar');

var http = require('http'),
    twilio = require('twilio');
app.use(bodyParser.urlencoded({
    extended: true
}));


router.get("/", function(req,res){

  // Twilio request authentication with custom URL
    var options = { url: 'https://enigmatic-lowlands-90835.herokuapp.com/' };
    if (twilio.validateExpressRequest(req, 'ee3db5ce904dd188912ea24b1646b46c', options)) {//'YOUR_TWILIO_AUTH_TOKEN'
      var resp = new twilio.TwimlResponse();
      resp.say('express sez - hello twilio!');

      res.type('text/xml');
      res.send(resp.toString());
    }
    else {
      res.status(403).send('you are not twilio. Buzz off.');
    }


  //require the Twilio module and create a REST client
var client = require('twilio')('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c');

//Send an SMS text message
client.sendMessage({

    to:'+16128121238', // Any number Twilio can deliver to
    from: '+17637102473', // A number you bought from Twilio and can use for outbound communication
    body: 'word to your mother.' // body of the SMS message

}, function(err, responseData) { //this function is executed when a response is received from Twilio

    if (!err) { // "err" is an error received during the request, if any

        // "responseData" is a JavaScript object containing data received from Twilio.
        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

        console.log(responseData.from); // outputs "+14506667788"
        console.log(responseData.body); // outputs "word to your mother."

    }
});

//Place a phone call, and respond with TwiML instructions from the given URL
client.makeCall({

    to:'+16128121238', // Any number Twilio can call
    from: '+17637102473', // A number you bought from Twilio and can use for outbound communication
    url: 'https://enigmatic-lowlands-90835.herokuapp.com/phoneCall.xml'//'https://demo.twilio.com/welcome/voice'//'https://432asfD:jlkajf32321fd@enigmatic-lowlands-90835.herokuapp.com/phoneCall.xml' // A URL that produces an XML document (TwiML) which contains instructions for the call

}, function(err, responseData) {

    //executed when the call has been initiated.
    console.log(responseData.from); // outputs "+14506667788"

});






});






module.exports = router;
