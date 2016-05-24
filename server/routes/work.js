var express = require("express");
var router = express.Router();
var db = require("../modules/db");
// var mongoURI = require("../modules/mongoURI");
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var darksky = require('darksky');//not using
var geocoder = require('geocoder');
var restler = require('restler');
var sugar = require('sugar');
var Agenda = require('agenda');//#AGENDA
var getForecast = require('../modules/forecast');

// var restrict = require("../modules/restrict"); // restricts user to be logedin to access route

// ---- Models ---- //
// var Contractor = require('../models/contractor');
var User = require('../models/user');
var Work = require('../models/work');


// ---- Modules ---- //
var newWorkAlert = require('../modules/newWorkAlert');


var twilio = require('twilio'),
client = twilio('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c'); //twilio('ACCOUNTSID', 'AUTHTOKEN'),
// var acceptedWorkReminder = require('../modules/acceptedWorkReminder');


// var Work = mongoose.model("Works");
// var Contractor = mongoose.model("Contractors");

console.log('currdatetime', Date.now());


router.route("/accept/")
    .put(function(req, res) {
      console.log('HELLO FROM PUT ON WORK/ACCEPT');
      console.log('INSIDE work/accept on server req.body._id:', req.body._id);
      console.log('req.user._id', req.user._id);
      Work.findById(req.body._id, function(err, work){
        console.log('INSIDE accept on server work:', work);
        if(err){
          console.log(err);
        }
        work.contractor_id = req.user._id; // req.user._id
        work.status = "Accept";
        // save the work
        work.save(function(err) {
          if (err)
          res.send(err);
          console.log('2nd INSIDE accept after save on server work:', work);

          User.findById(work.contractor_id, function(err, contractor){
            console.log('INSIDE accept on server work.contractor_id contractor:', contractor);
            if(err){
              console.log(err);
            }
              acceptedWorkReminder(work, contractor);
              // res.json({ message: 'work updated with accept!' });
            });

          // res.json({ message: 'work updated with accept!' });
        });
      });
    });

router.route("/complete")
.put(function(req, res) {
  console.log('INSIDE work/complete on server req.body:', req.body._id);
  Work.findById(req.body._id, function(err, work){
    console.log('INSIDE complete on server work:', work);
    if(err){
      console.log(err);
    }
    work.status = 'complete';
    // save the work
    work.save(function(err) {
      console.log('WORK UPDATED WITH COMPLETE !!!!!!!');
      postToPayable();
      if (err)
      res.send(err);
      // res.json({ message: 'WORK UPDATED WITH COMPLETE !!!!!!!' });
    });
  });
});



router.post("/", function(req,res){
  console.log('1 inside post on server req.user._id', req.body );

  // MOBILE: the line below is used for adding work on MOBILE APP
  // var type = "req.body.type",
  // datetime = "req.body.datetime",
  // endTime = "req.body.endTime",
  // address = req.body.address,
  // details = "req.body.details",
  // customer_id = req.user._id,
  // contractor_id = '',
  // status = "req.body.status";
  var type = req.body.type,
  datetime = req.body.datetime,
  endTime = req.body.endTime,
  address = req.body.address,
  details = req.body.details,
  customer_id = req.user._id,
  contractor_id = '',
  status = req.body.status;
  console.log('2 inside post on server req.user._id', req.user );
  // Geocode item work
  geocoder.geocode(address, function ( err, geocodedData ) {
    var geocodedData = geocodedData.results[0].geometry.location;
    var geo = [];
    geo[0]=geocodedData.lat;
    geo[1]=geocodedData.lng;
    var lat = geo[0];
    var lon = geo[1];
    //getting weather info with Forecast.io package
    var workdatetime =  datetime;
    console.log('workdatetime:' ,workdatetime);
    console.log('Date.create(workdatetime):' ,Date.create(workdatetime));
    console.log('(8).hoursBefore(workdatetime):' ,(2).hoursBefore(workdatetime));
    workdatetime = (2).hoursBefore(workdatetime);
    unixtime = workdatetime.getTime();
    unixtime = ""+unixtime;
    unixtime = '2013-05-06T12:00:00-0400'; // '1461067200' or unixtime.slice(0, - 3);
    console.log(' (2).hoursBefore(workdatetime) in milliseconds:' , unixtime);
    var latLonTime = ""+geo[0]+","+geo[1]+","+unixtime; //"34.6036,98.3959"

    var Forecast = require('forecast.io');
    var options = {
      APIKey: 'a7477969f3764bd6cd2bf01efa7a7365', //process.env.FORECAST_API_KEY
      timeout: 1000
    },
    forecast = new Forecast(options);
    var past = Math.round((new Date()).getTime() / 1000) - 57600;
    var getForecast = function(latitude, longitude, time){
      forecast.getAtTime(latitude, longitude, time, function (err, res, data) {
        if (err) throw err;
        console.log('H E L L O data inside forecast.js: ', data);
        // console.log('data inside forecast.js: ', data);
        // return data;
        var workWeather =[];
        workWeather.push(data);
        //save work instence with geocode and weather info
        // console.log('W E A T H E R !!! !!!!!  ::  ', res.headers);
        var addedWork = new Work({"type" : type, "datetime" : datetime, "endTime" : endTime,  "address" : address, "details" : details, "status" : status, "customer_id" : customer_id, "contractor_id" : contractor_id, geo : geo, weather : workWeather });
        addedWork.save(function(err, data){
          if(err){
            console.log(err);
          }
          console.log('data (new work item SAVED inside addWork.save) ',data);
          newWorkAlert(addedWork);
        });//END addedWork.save
      });//END forecast.getAtTime
    }//END var getForecast
    getForecast(lat,lon,past);
  });//END geocoder.geocode
});// END router.post


router.get("/availibleWork", function(req,res){
console.log('INSIDE get availibleWork on work req.user._id: ',req.user);
console.log('INSIDE get availibleWork on work req.user.geo[0]: ',req.user.geo[0]);
console.log('INSIDE get availibleWork on work req.user.geo[1]: ',req.user.geo[1]);

      var distance = 1000 / 3963.2;
      var query = Work.find({'geo': {
        $near: [
          req.user.geo[0],
          req.user.geo[1]
        ],
        $maxDistance: distance
        }
        /**@todo figureout how to compair where contractor.type equals addedWork.type*/
      }).where('type').equals(req.user.type).where('status').ne('Accept');
      query.exec(function (err, availibleWorks) {
        console.log(' inside query.exec contractors nearby : ', availibleWorks);
        if (err) {
          console.log(err);
          throw err;
        }
        if (!availibleWorks) {
          console.log('Did not find any matching item : ',  availibleWorks);
          res.json({});
        } else {
          console.log('Found matching works in contractor area: ', availibleWorks);
          // res.send(availibleWorks);
          res.json(availibleWorks);
       }
      });
});

router.get("/contractorWork", function(req,res){

    Work.find(function (err, work) {
      if (err) {
        res.send(err, null);
      }
      console.log("req.user._id", req.user._id);
      console.log("FOUND ALL WORKS CONTRACTOR ACCEPTED", work);
      res.send(work);
    }).where('contractor_id').equals(''+req.user._id);
      // query.exec(function (err, contractorWork) {
      //   console.log(' inside query.exec contractors nearby : ', contractorWork);
      //   if (err) {
      //     console.log(err);
      //     throw err;
      //   }
      //   if (!contractorWork) {
      //     console.log('Did not find any matching item : ',  contractorWork);
      //     res.json({});
      //   } else {
      //     console.log("Found all the contractor's work which they have accepted: ", contractorWork);
      //     res.send(contractorWork);
      //     // res.json(contractorWork);
      //  }
      // });
});


router.get("/", function(req,res){
/**@todo find and send all works for this customer */
console.log('INSIDE get on work req.user._id: ',req.user._id);
console.log(req.user._id);
var workArray = [];
Work.find(function (err, work) {
      if (err) {
        res.send(err, null);
      }
      res.send(work);
      var resSend = function(){
        console.log('workArray :', workArray);
        res.send(workArray);
      };
    }).or([{ customer_id: ''+req.user._id }, { contractor_id: ''+req.user._id }]).where('status').ne('canceled');
});

router.route("/update")
    .put(function(req, res) {
      // console.log('INSIDE cancel on server req.params.id:', req.params.id);
      console.log('INSIDE update on server req.params.id:::::', req.body);
    //   Work.findById(req.body._id, function(err, work){
    //   console.log('INSIDE cancel on server work:', work);
    //
    //       if(err){
    //         console.log(err);
    //       }
    //       work.status = 'canceled';
    //       // save the work
    //         work.save(function(err) {
    //             if (err)
    //                 res.send(err);
    //       res.json({ message: 'work updated!' });
    //   });
    // });
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

  var mongoURI =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/work';

var acceptedWorkReminder =  function(acceptedWork, contractor){

  var agenda = new Agenda({db: {address: mongoURI}});
  console.log('INSIDE at the top acceptedWorkReminder acceptedWork:', acceptedWork);
  console.log('INSIDE at the top acceptedWorkReminder contractor:', contractor);



  var emailNotification = function(addedWork, contractor){
    contractorFname = contractor.fname;
    contractorLname = contractor.lname;
    contractorEmail = contractor.email;
    var nodemailer = require('nodemailer');
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport('smtps://modespeaking%40gmail.com:gwtexvqycbstxzvf@smtp.gmail.com');
    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"Mode Speak 👥" <modespeaking@gmail.com>', // sender address
      to: contractorEmail, // list of receivers
      subject: 'Hello ✔', // Subject line
      text: 'Hello '+ contractorFname +'  '+ contractorLname +'🐴 This is confirmation that you have accepted the following work assignment. TYPE: '
      +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime, // plaintext body
      html: '<b>Hello '+ contractorFname +'  '+ contractorLname +' 🐴 This is confirmation that you have accepted the following work assignment. TYPE: '
      +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime+"</b>" // html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        return console.log(error);
      }
      console.log('Message sent: ' + info.response);
    });
  }
  var smsReminder = function(addedWork, contractor){
    console.log('INSIDE smsReminder FUNCTION: contractor ',contractor);
    console.log('INSIDE smsReminder FUNCTION: addedWork ',addedWork);

    contractorFname = contractor.firstname;
    contractorLname = contractor.lastname;
    contractorEmail = contractor.email;
    contractorPhone = contractor.phone;
      //SMS
      var accountSid = 'AC266d44c5ce01697df6f475b34f850d8f';
      var authToken = "ee3db5ce904dd188912ea24b1646b46c"; //"{{ auth_token }}";
      var client = require('twilio')(accountSid, authToken);

      client.messages.create({
          body: 'Hello '+contractorFname+'  '+contractorLname+' 🐴 This is a remider of your upcoming appointment: '
          +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime, // plaintext body
          html: '<b>Hello '+ contractorFname +'  '+ contractorLname +' 🐴 This is a remider of your upcoming appointment: '
          +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime+"</b>", // html body
          to: "+16128121238",
          from: "+16122844292"
      }, function(err, message) {
          process.stdout.write(message.sid);
      }); //End client.messages.create function
}//End sendSMS function

  var phoneReminder =  function(addedWork, contractor){
    contractorFname = contractor.fname;
    contractorLname = contractor.lname;
    contractorEmail = contractor.email;
    contractorPhone = contractor.phone;
    contractor_id = contractor._id;
    var work_id =  addedWork._id;


    //BEGIN CALL
    client.calls.create({
      url: "https://07cf7bc3.ngrok.io/voice/?user_id="+contractor_id+"&work_id="+work_id, //"https://enigmatic-lowlands-90835.herokuapp.com/phoneCall.xml" "twiml" "http://demo.twilio.com/docs/voice.xml" "http://localhost:5005/public/assets/scripts/twiml.xml" "http://localhost/public/assets/scripts/twiml.xml" "http://twimlbin.com/0e4f056c3572ca5bc51f86e9f8e7d962"
              //https://8f7e319b.ngrok.io/ivr/welcome
      // url: "https://8f7e319b.ngrok.io/phoneCall/?user_id=12345", //"https://enigmatic-lowlands-90835.herokuapp.com/phoneCall.xml" "twiml" "http://demo.twilio.com/docs/voice.xml" "http://localhost:5005/public/assets/scripts/twiml.xml" "http://localhost/public/assets/scripts/twiml.xml" "http://twimlbin.com/0e4f056c3572ca5bc51f86e9f8e7d962"
      to: contractorPhone, //+16122671744  "+16128121238" "+16129631395 Dev" 8023561672 Tommy
      from: "+17637102473",  //+17637102473  16122844292
      method: "GET"
    }, function(err, call) {
      console.log('This call\'s unique ID is: ' + call.sid);
      console.log('This call was created at: ' + call.dateCreated);
      process.stdout.write(call.sid);
      console.log('Received call from: ' + call.from);
    }); //END CALL
  };




  /*Schedule for email(rightaway) -- */
  agenda.define('send emailNotification', function(job, done) {
    console.log('I sent emailNotification rightaway');
      emailNotification(acceptedWork, contractor);
      done();
  });
  /*Schedule for PhoneCall(24hours) -- */
  agenda.define('send phoneReminder', function(job, done) {
    console.log('I sent phoneReminder in t - 24hours');
    phoneReminder(acceptedWork, contractor);
    done();
  });
  /*Schedule for SMS(2hours),-- */
  agenda.define('send smsReminder', function(job, done) {
    console.log('I sent smsReminder in t - 2 hours');
    smsReminder(acceptedWork, contractor);
    done();
  });
  /*Activate all the notifications,-- */
  agenda.on('ready', function() {
    agenda.schedule('now', 'send emailNotification');
    agenda.schedule('in 1 minutes', 'send phoneReminder');
    agenda.schedule('in 2 minutes', 'send smsReminder');
    agenda.start();
  });
}


var postToPayable = function(){
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
      start:'2016-03-17T08:16:19Z',
      end:'2016-03-17T010:16:19Z',
      notes:'Hello great job on this assignment Ben',
      amount: 500
  }},
  function(err,httpResponse,body){

    console.log('body in app.post return from Payable ',body);
    // res.send(body);

 });
}


module.exports = router;
