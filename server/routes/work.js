var express = require("express");
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
// ---- Modules ---- //
var newWorkAlert = require('../modules/newWorkAlert');


mongoose.model("Works", new Schema({
  "type" : String, "datetime" : String, "endTime" : String,
"address" : String, "details" : String, "customer_id" : String, "status" : String, "geo": {
    type: [Number],
    index: '2d'
  }
}));

var Work = mongoose.model("Works");
console.log('currdatetime', Date.now());

router.post("/", function(req,res){
  var type = req.body.type,
      datetime = req.body.datetime,
      endTime = req.body.endTime,
      address = req.body.address,
      details = req.body.details,
      customer_id = req.body.customer_id,
      status = req.body.status;
// Geocode and save work to database
      geocoder.geocode(address, function ( err, geocodedData ) {
        var geocodedData = geocodedData.results[0].geometry.location;
        var geo = [];
            geo[0]=geocodedData.lat;
            geo[1]=geocodedData.lng;
// saving geocoded address to the database
        var addedWork = new Work({"type" : type, "datetime" : datetime, "endTime" : endTime,  "address" : address, "details" : details, "status" : status, "customer_id" : customer_id, geo : geo });
        addedWork.save(function(err, data){
            if(err){
              console.log(err);
              console.log('data (new work item created inside addWork.save) ',data);
            }
            newWorkAlert(addedWork);
            res.send(data);
        });
      });
/**@todo find all contractors nearby who match work.type then alert them via 1) Email, 2) SMS */
        // //qury for nearby locations -- this code works
        // var distance = 1000 / 6371;
        // var query = Work.find({'geo': {
        //   $near: [
        //     44.969220, //req.body.lat,
        //     -93.273994 //req.body.lng
        //   ],
        //   $maxDistance: distance
        //   }
        // });
        // query.exec(function (err, work) {
        //   console.log('work inside query.exec', work);
        //   if (err) {
        //     console.log(err);
        //     throw err;
        //   }
        //   if (!work) {
        //     console.log('Found did not find any matching item : ' + work);
        //     res.json({});
        //   } else {
        //     console.log('Found matching item: ' + work);
        //     res.json(work);
        //  }
        // });
        // //end of query

});


router.get("/", function(req,res){
/**@todo find and send all works for this customer */

Work.find(function (err, work) {
      if (err) {
        res.send(err, null);
      }
      res.send(work);
    });

});

router.route("/:id")
    .delete(function(req,res){
        // console.log("Inside delete on server: ",  req.params.id);
        Work.findByIdAndRemove(req.params.id, function(err, work){
            if(err){
              console.log(err);
            }
            res.send(work);
        });
    })
    // update the work with this id (accessed at PUT http://localhost:8080/api/works/:work_id)
    .put(function(req, res) {
      console.log('INSIDE cancel on server req.params.id:', req.params.id);
      Work.findById(req.params.id, function(err, work){
      console.log('INSIDE cancel on server work:', work);

          if(err){
            console.log(err);
          }
          work.status = 'canceled';
          // save the work
            work.save(function(err) {
                if (err)
                    res.send(err);
          res.json({ message: 'work updated!' });
      });
    });
  });



router.get("/zzzzzzzzzzz", function(req,res){
//   <?xml version="1.0" encoding="UTF-8"?>
//    <Response>
//    <Say voice="alice">To get connected to your interpreting sesson, enter your 4 digit key</Say>
//    <Play>http://demo.twilio.com/docs/classic.mp3</Play>
//    </Response>
//
//
//    var obj = {
//   Response: {
//     Say voice: "John",
//     address: {
//       city: "Istanbul"
//     },
//     phone: [
//       { '#text': "555-1234", '@type': 'home' },
//       { '#text': "555-1235", '@type': 'mobile' }
//     ],
//     id: function() {
//       return 42;
//     }
//   }
// };
//
// var builder = require('xmlbuilder');
// var root = builder.create(obj);


  //
  // var builder = require('xmlbuilder');
  // var xml = builder.create('root')
  // .ele('xmlbuilder','encoding')
  // .ele('repo', {'type': 'git'}, 'git://github.com/oozcitak/xmlbuilder-js.git')
  // .end({ pretty: true});
  // console.log(xml);


//
//
//    //ALL OF THE CODE BELOW WORKS...COMMENTED OUT TO TEST GEOCODER ABOVE
//   //EMAIL
//   // var sendSMSandVoice = function(){
//   var nodemailer = require('nodemailer');
//   // create reusable transporter object using the default SMTP transport
//   var transporter = nodemailer.createTransport('smtps://modespeaking%40gmail.com:gwtexvqycbstxzvf@smtp.gmail.com');
//   // setup e-mail data with unicode symbols
//   var mailOptions = {
//     from: '"Mode Speak 👥" <modespeaking@gmail.com>', // sender address
//     to: 'melliott03@gmail.com, mike.elliott@live.com', // list of receivers
//     subject: 'Hello ✔', // Subject line
//     text: 'Hello world 🐴', // plaintext body
//     html: '<b>Hello world 🐴</b>' // html body
//   };
//   // send mail with defined transport object
//   transporter.sendMail(mailOptions, function(error, info){
//     if(error){
//       return console.log(error);
//     }
//     console.log('Message sent: ' + info.response);
//   });
//
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

  // client.sendMessage({
  //   to:'6128121238',
  //   from:'6122844292',
  //   body:'Hello! Hope you’re having a good day!' }, function( err, data ) {
  //   });


     //BEGIN CALL
  client = twilio('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c'); //twilio('ACCOUNTSID', 'AUTHTOKEN'),
  client.calls.create({
    url: "https://enigmatic-lowlands-90835.herokuapp.com/phoneCall/?user_id=12345", //"https://enigmatic-lowlands-90835.herokuapp.com/phoneCall.xml" "twiml" "http://demo.twilio.com/docs/voice.xml" "http://localhost:5005/public/assets/scripts/twiml.xml" "http://localhost/public/assets/scripts/twiml.xml" "http://twimlbin.com/0e4f056c3572ca5bc51f86e9f8e7d962"
    // url: "https://enigmatic-lowlands-90835.herokuapp.com/phoneCall/?user_id=12345&appointment_id=12345", //"./public/assets/scripts/twiml.xml" "twiml" "http://demo.twilio.com/docs/voice.xml" "http://localhost:5005/public/assets/scripts/twiml.xml" "http://localhost/public/assets/scripts/twiml.xml" "http://twimlbin.com/0e4f056c3572ca5bc51f86e9f8e7d962"
    to: "+16128121238", //+16122671744  "+16128121238" "+16129631395 Dev" 8023561672 Tommy
    from: "+17637102473",  //+17637102473  16122844292
    method: "GET"
  }, function(err, call) {
    console.log('This call\'s unique ID is: ' + call.sid);
    console.log('This call was created at: ' + call.dateCreated);
    process.stdout.write(call.sid);
    console.log('Received call from: ' + call.from);
  }); //END CALL

//   // client.calls.get(function(err, response) {
//   //   response.calls.forEach(function(call) {
//   //     console.log('Received call from: ' + call.from);
//   //     console.log('Call duration (in seconds): ' + call.duration);
//   //   });
//   // });
//
//
//   //PAYABLE
//   var request = require('request'),
//   username = "1064627855",
//   password = "ZLBKgzq2XskgkLj-D4Eo7VUiwo8fucN7",
//   url = "https://" + username + ":" + password + "@api.payable.com/v1/work";
//
//   request(
//     {
//       url : url
//     },
//     function (error, response, body) {
//       // Do more stuff with 'body' here
//       // console.log(err);
//       console.log('body in router.get request return from Payable ',body);
//       // res.send(body);
//     }
//   );
//
//   //WEATHER (ALERTS) use a UNIX GMT timestamp converter for angular to make datetime human readable
//   var data = "34.6036,98.3959";
//   const https = require('https');
//   https.get("https://api.forecast.io/forecast/a7477969f3764bd6cd2bf01efa7a7365/" + data, (res) => {
//     console.log('statusCode: ', res.statusCode);
//     console.log('headers: ', res.headers);
//     res.on('data', (d) => {
//       process.stdout.write(d);
//     });
//   }).on('error', (e) => {
//     console.error(e);
//   }); // END WEATHER
//
// //   //npm install darksky
// //   var darksky = require("darksky");
// //   var client = new darksky.Client("a7477969f3764bd6cd2bf01efa7a7365");
// //
// //   client.forecast('37.8267','-122.423',
// //   function(err, data) {
// //     if (err) {
// //       console.error(err);
// //     }
// //     process.stdout.write(data);
// //   }
// // );
//
//   // Hourly Forecast
//   // https://api.darkskyapp.com/v1/forecast/APIKEY/LAT,LON
//   // https://api.darkskyapp.com/v1/brief_forecast/APIKEY/LAT,LON
//   // Returns a forecast for the next hour at a given location.
//   //
//   // Multiple Points and Times
//   // https://api.darkskyapp.com/v1/precipitation/APIKEY/LAT1,LON1,TIME1;LAT2,LON2,TIME2;...
//   // Returns forecasts for a collection of arbitrary points.
//   //
//   // Currently Interesting Storms
//   // https://api.darkskyapp.com/v1/interesting/APIKEY
//   // Returns a list of interesting storms happening right now.
//
//
//   //GEOCODE
//   // Geocoding
//   geocoder.geocode("5650 Humboldt Avenue North Brooklyn Center Mn 55430", function ( err, data ) {
//     // //do something with data
//     // console.log('address_components ', data);
//     // res.send(data.results[0].geometry.location);
//     // //saving geocoded address to the database
//     var addedWork = new Work({"address" : "5650 Humboldt Avenue North Brooklyn Center Mn 55430", "language" : "spanish", geo : [45.05, -93.29 ] });
//     // var addedWork = new Work({"address" : req.body.address, "language" : req.body.language, "time" : req.body.time});
//     addedWork.save(function(err, data){
//         if(err){
//           console.log(err);
//           console.log('data (new work item created inside addWork.save) ',data);
//         }
//         // res.send(data);
//     });
//   });
//
//     //qury for nearby locations -- this code works
//     var distance = 1000 / 6371;
//     var query = Work.find({'geo': {
//       $near: [
//         44.969220, //req.body.lat,
//         -93.273994 //req.body.lng
//       ],
//       $maxDistance: distance
//       }
//     });
//     query.exec(function (err, work) {
//       console.log('work inside query.exec', work);
//       if (err) {
//         console.log(err);
//         throw err;
//       }
//       if (!work) {
//         console.log('Found did not find any matching item : ' + work);
//         res.json({});
//       } else {
//         console.log('Found matching item: ' + work);
//         res.json(work);
//      }
//     });
//     //end of query
//
//   //MAP TRAFFIC CONDITIONS AND ALERTS
// // };//bracket ends function decleration for sendSMSandVoice
//
// // agenda.schedule('1459946405', 'sendSMSandVoice');
//
//
//
//
// //
// // client = twilio('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c'); //twilio('ACCOUNTSID', 'AUTHTOKEN'),
// // client.calls.create({
// //   url: "http://432asfD:jlkajf32321fd@enigmatic-lowlands-90835.herokuapp.com/phoneCall.xml", //"./public/assets/scripts/twiml.xml" "twiml" "http://demo.twilio.com/docs/voice.xml" "http://localhost:5005/public/assets/scripts/twiml.xml" "http://localhost/public/assets/scripts/twiml.xml" "http://twimlbin.com/0e4f056c3572ca5bc51f86e9f8e7d962"
// //   to: "+16128121238", //+16122671744  "+16128121238" "+16129631395 Dev" 8023561672 Tommy
// //   from: "+17637102473"  //+17637102473  16122844292
// // }, function(err, call) {
// //   console.log('This call\'s unique ID is: ' + call.sid);
// //   console.log('This call was created at: ' + call.dateCreated);
// //   process.stdout.write(call.sid);
// //   console.log('Received call from: ' + call.from);
// // });
//
// // //BEGIN PHONE CALL
// // var request = require('request'),
// // username = "432asfD",
// // password = "jlkajf32321fd",
// // url = "https://" + username + ":" + password + "@enigmatic-lowlands-90835.herokuapp.com/phoneCall.xml";
// //
// // request.post({
// //   url:url,
// //   to: "+16128121238", //+16122671744  "+16128121238" "+16129631395 Dev" 8023561672 Tommy
// //   from: "+17637102473"  //+17637102473  16122844292
// // }),
// // function(err,httpResponse,body){
// //
// //   console.log('body in app.post return from Payable ',body);
// //
// // };
// // //END PHONE CALL

// //START NEW PHONE CALL http://stackoverflow.com/questions/11800385/node-js-and-twilio-integration
// var https = require('https');
// var qs = require('querystring');
// var username = "432asfD";
// var password = "jlkajf32321fd";
// var api = 'AC266d44c5ce01697df6f475b34f850d8f'; //'your api key';
// var auth = 'ee3db5ce904dd188912ea24b1646b46c'; //'your auth token';
//
// var postdata = qs.stringify({
//     'From' : '+17637102473',
//     'To' : '+16128121238',
//     'Url' : "https://" + username + ":" + password + "@enigmatic-lowlands-90835.herokuapp.com/phoneCall.xml"
// });
//
// var options = {
//     host: 'api.twilio.com',
//     path: '/2010-04-01/Accounts/AC266d44c5ce01697df6f475b34f850d8f/Calls.xml', //'/2010-04-01/Accounts/<your api key>/Calls.xml',
//     port: 443,
//     method: 'POST',
//     headers: {
//         'Content-Type' : 'application/x-www-form-urlencoded',
//         'Content-Length' : postdata.length
//     },
//     auth: api + ':' + auth
// };
//
// var request = https.request(options, function(res){
//     res.setEncoding('utf8');
//     res.on('data', function(chunk){
//         console.log('Response: ' + chunk);
//     })
// })
//
// request.write(postdata);
// request.end();
// //END NEW PHONE CALL
});




module.exports = router;
