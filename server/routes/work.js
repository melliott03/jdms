var express = require("express");
var router = express.Router();
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Forecast = require('forecast');//not using
var darksky = require('darksky');//not using
var geocoder = require('geocoder');
// var twiml = require('./public/assets/scripts/twiml.js');
var restler = require('restler');
// var User = require("./models/work");
// var kue = require('kue') //delayed job don't think i'll use this...will use agenda instead
//   , queue = kue.createQueue();
// var agenda = require('agenda');

// var mongoConnectionString = "mongodb://127.0.0.1/agenda";
// var agenda = new Agenda({db: {address: mongoConnectionString}});

var sugar = require('sugar');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));

// mongoose.connect('mongodb://localhost/work');
mongoose.model("Works", new Schema({"address" : String, "language" : String,
  "geo": {
    type: [Number],
    index: '2d'
  }
}));
var Work = mongoose.model("Works");

// agenda.schedule('today at noon', 'printAnalyticsReport', {userCount: 100});

console.log('currdatetime', Date.now());

router.get("/", function(req,res){


   //ALL OF THE CODE BELOW WORKS...COMMENTED OUT TO TEST GEOCODER ABOVE
  //EMAIL
  // var sendSMSandVoice = function(){
  var nodemailer = require('nodemailer');
  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport('smtps://modespeaking%40gmail.com:gwtexvqycbstxzvf@smtp.gmail.com');
  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: '"Mode Speak 👥" <modespeaking@gmail.com>', // sender address
    to: 'melliott03@gmail.com, mike.elliott@live.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world 🐴', // plaintext body
    html: '<b>Hello world 🐴</b>' // html body
  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });

  //SMS
  var twilio = require('twilio'),
  client = twilio('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c'); //twilio('ACCOUNTSID', 'AUTHTOKEN'),
  // var cronJob = require('cron').CronJob;

  // var textJob = new cronJob( '33 5 * * *', function(){ // represents 33 minutes past 5am
  //   client.sendMessage( {
  //     to:'6128121238',
  //     from:'7637102473',
  //     body:'Hello! Hope you’re having a good day!' }, function( err, data ) {
  //     });
  // },  null, true);
  client.sendMessage({
    to:'6128121238',
    from:'7637102473',
    body:'Hello! Hope you’re having a good day!' }, function( err, data ) {
    });



  client = twilio('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c'); //twilio('ACCOUNTSID', 'AUTHTOKEN'),
  client.calls.create({
    //https://studentrnd.org/build/tutorial-creating-a-reddit-browser-with-node-js-and-twilio

    // restler.get('http://reddit.com/.json').on('complete', function(reddit) {
    //     var titles = "<Response>";
    //     for(var i=0; i<5; i++) {
    //         titles += "<Sms>" + reddit.data.children[i].data.title + "</Sms>";
    //     }
    //     titles += "</Response>";
    //     response.send(titles);
    // });

    url: "https://enigmatic-lowlands-90835.herokuapp.com/phoneCall.xml", //"./public/assets/scripts/twiml.xml" "twiml" "http://demo.twilio.com/docs/voice.xml" "http://localhost:5005/public/assets/scripts/twiml.xml" "http://localhost/public/assets/scripts/twiml.xml" "http://twimlbin.com/0e4f056c3572ca5bc51f86e9f8e7d962"
    to: "+16128121238", //+16122671744  "+16128121238" "+16129631395 Dev" 8023561672 Tommy
    from: "+17637102473"
  }, function(err, call) {
    console.log('This call\'s unique ID is: ' + call.sid);
    console.log('This call was created at: ' + call.dateCreated);
    process.stdout.write(call.sid);
    console.log('Received call from: ' + call.from);
    // console.log('Call duration (in seconds): ' + call.Direction);
  });

  // client.calls.get(function(err, response) {
  //   response.calls.forEach(function(call) {
  //     console.log('Received call from: ' + call.from);
  //     console.log('Call duration (in seconds): ' + call.duration);
  //   });
  // });


  //PAYABLE
  var request = require('request'),
  username = "1064627855",
  password = "ZLBKgzq2XskgkLj-D4Eo7VUiwo8fucN7",
  url = "https://" + username + ":" + password + "@api.payable.com/v1/work";

  request(
    {
      url : url
    },
    function (error, response, body) {
      // Do more stuff with 'body' here
      // console.log(err);
      console.log('body in router.get request return from Payable ',body);
      // res.send(body);
    }
  );

  //WEATHER (ALERTS) use a UNIX GMT timestamp converter for angular to make datetime human readable
  var data = "34.6036,98.3959";
  const https = require('https');
  https.get("https://api.forecast.io/forecast/a7477969f3764bd6cd2bf01efa7a7365/" + data, (res) => {
    console.log('statusCode: ', res.statusCode);
    console.log('headers: ', res.headers);
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  }).on('error', (e) => {
    console.error(e);
  });

//   //npm install darksky
//   var darksky = require("darksky");
//   var client = new darksky.Client("a7477969f3764bd6cd2bf01efa7a7365");
//
//   client.forecast('37.8267','-122.423',
//   function(err, data) {
//     if (err) {
//       console.error(err);
//     }
//     process.stdout.write(data);
//   }
// );

  // Hourly Forecast
  // https://api.darkskyapp.com/v1/forecast/APIKEY/LAT,LON
  // https://api.darkskyapp.com/v1/brief_forecast/APIKEY/LAT,LON
  // Returns a forecast for the next hour at a given location.
  //
  // Multiple Points and Times
  // https://api.darkskyapp.com/v1/precipitation/APIKEY/LAT1,LON1,TIME1;LAT2,LON2,TIME2;...
  // Returns forecasts for a collection of arbitrary points.
  //
  // Currently Interesting Storms
  // https://api.darkskyapp.com/v1/interesting/APIKEY
  // Returns a list of interesting storms happening right now.


  //GEOCODE
  // Geocoding
  geocoder.geocode("5650 Humboldt Avenue North Brooklyn Center Mn 55430", function ( err, data ) {
    // //do something with data
    // console.log('address_components ', data);
    // res.send(data.results[0].geometry.location);
    // //saving geocoded address to the database
    var addedWork = new Work({"address" : "5650 Humboldt Avenue North Brooklyn Center Mn 55430", "language" : "spanish", geo : [45.05, -93.29 ] });
    // var addedWork = new Work({"address" : req.body.address, "language" : req.body.language, "time" : req.body.time});
    addedWork.save(function(err, data){
        if(err){
          console.log(err);
          console.log('data (new work item created inside addWork.save) ',data);
        }
        // res.send(data);
    });
  });

    //qury for nearby locations -- this code works
    var distance = 1000 / 6371;
    var query = Work.find({'geo': {
      $near: [
        44.969220, //req.body.lat,
        -93.273994 //req.body.lng
      ],
      $maxDistance: distance
      }
    });
    query.exec(function (err, work) {
      console.log('work inside query.exec', work);
      if (err) {
        console.log(err);
        throw err;
      }
      if (!work) {
        console.log('Found did not find any matching item : ' + work);
        res.json({});
      } else {
        console.log('Found matching item: ' + work);
        res.json(work);
     }
    });
    //end of query

  //MAP TRAFFIC CONDITIONS AND ALERTS
// };//bracket ends function decleration for sendSMSandVoice

// agenda.schedule('1459946405', 'sendSMSandVoice');


});

router.post("/work", function(req,res){
    console.log(req.body);


    var request = require('request'),
    username = "1064627855",
    password = "ZLBKgzq2XskgkLj-D4Eo7VUiwo8fucN7",
    url = "https://" + username + ":" + password + "@api.payable.com/v1/work";

    request.post({
      url:url,
      form: {
        worker_id : '2665370794',
        work_type_id : 2413827961,
        quantity : 24,
        start:'2016-03-15T08:16:19Z',
        end:'2016-03-15T010:16:19Z',
        notes:'Hello great job on this assignment'
    }},
    function(err,httpResponse,body){

      console.log('body in app.post return from Payable ',body);
      res.send(body);

   });
    // request.post(
    //   {
    //     url : url,
    //   },
    //   function (error, response, body) {
    //     // Do more stuff with 'body' here
    //     // console.log(err);
    //     console.log('body in app.get request return from Payable ',body);
    //     res.send(body);
    //   }
    // );


    // var addedMovie = new Movie({"Title" : req.body.Title, "Runtime" : req.body.Runtime, "Rated" : req.body.Rated, "Actors" : req.body.Actors, "Plot": req.body.Plot});
    // addedMovie.save(function(err, data){
    //     if(err){
    //       console.log(err);
    //     }
    //
    //     res.send(data);
    // });


});

/*
Perform date manipulations based on adding or subtracting time

//First, start with a particular time
var date = new Date();

//Add two hours
date.setHours(date.getHours() + 2);

//Go back 3 days
date.setDate(date.getDate() - 3);

//One minute ago...
date.setMinutes(date.getMinutes() - 1);


*/





module.exports = router;
