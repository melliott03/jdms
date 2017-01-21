var express = require("express");
var router = express.Router();
var db = require("../modules/db");
// var mongoURI = require("../modules/mongoURI");
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
mongoose.Promise = require('bluebird'); // set Promise provider to bluebird
var Promise = require('bluebird');
var Schema = mongoose.Schema;
var darksky = require('darksky');//not using
// var geocoder = require('geocoder');
var geocoder = Promise.promisifyAll(require('geocoder'));
var restler = require('restler');
// var sugar = require('sugar');
var Agenda = require('agenda');//#AGENDA
var getForecast = require('../modules/forecast');
var stripeChargePay = require('../modules/stripeTransactions');
var stripe = require("stripe")(process.env.STRIPE_TEST);
var workRatesTotal = require('../modules/workRatesTotal');
var workPayTotal = require('../modules/workPayTotal');
var payable = require('../modules/payable');

var moment = require('moment');

// var restrict = require("../modules/restrict"); // restricts user to be logedin to access route

// ---- Models ---- //
// var Contractor = require('../models/contractor');
var User = require('../models/user');
var Work = require('../models/work');
var Work_Tel = require('../models/work_tel');
// var Work_Tel = mongoose.model('Work_Tel');
Promise.promisifyAll(Work_Tel);
Promise.promisifyAll(Work_Tel.prototype);

// ---- Modules ---- //
var newWorkAlert = require('../modules/newWorkAlert');


var twilio = require('twilio'),
client = twilio('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c'); //twilio('ACCOUNTSID', 'AUTHTOKEN'),
// var acceptedWorkReminder = require('../modules/acceptedWorkReminder');

var shortid = require('shortid');

// var Work = mongoose.model("Works");
// var Contractor = mongoose.model("Contractors");


// router.use(function(req, res, next){ //https://onedesigncompany.com/news/express-generator-and-socket-io
//   res.io = io;
//   next();
// });

/*
router.get("/calls", function(req,res){
  var requser = req.user;
//@todo find and send all works for this customer
console.log('INSIDE get on work req.user._id:: ',req.user._id);
console.log('INSIDE get on work req.user:: ',req.user);
console.log(req.user._id);
if (requser.role == 'customer') {
  var promised = Work_Tel.find({customer_id: req.user._id}).exec();
} else if(requser.role == 'contractor') {
  var promised = Work_Tel.find({contractor_id: req.user._id}).exec();
} else if (requser.role == 'admin'){
  var promised = Work_Tel.find({}).exec();
}
promised.then(function(work_Tels) {
  console.log('Work_Tels documents found for '+requser.role+' are ::', work_Tels);
  var newWork_tels = [];
  work_Tels.map(function(obj){
    if (obj.inboundSummary && obj.outboundSummary && obj.outboundSummary.createdAt && obj.money && obj.money.customerCost) {
      console.log('inside if (obj.inboundSummary && obj.outboundSummary && obj.money && obj.money.customerCost)::');
      newWork_tels.push(obj);
    }
  });

  return newWork_tels;
})
.then(function(work_tels) {
  console.log('inside the then work_tels::', work_tels);
  work_tels.sort(function(aze,bze){return Date.parse(bze.outboundSummary.createdAt) - Date.parse(aze.outboundSummary.createdAt)});
  console.log('after sorting by date work_tels::', work_tels);
  res.send(work_tels);
})
.catch(function(err){
  // just need one of these
  console.log('error:', err);
});
});// END router.get
*/


router.get("/bookings", function(req,res){
  var requser = req.user;
/**@todo find and send all works for this customer */
console.log('INSIDE bookings get on work req.user._id:: ',req.user._id);
console.log('INSIDE bookings get on work req.user:: ',req.user);
console.log(req.user._id);
var params = {};
if (requser.role == 'customer') {
  params = {customer_id: req.user._id}
} else if(requser.role == 'contractor') {
  params = {contractor_id: req.user._id}
} else if (requser.role == 'admin'){
  params = {}
}

var promised = Work_Tel.find(params).exec();
promised.then(function(work_Tels) {
  console.log('Work_Tels bookingid documents found for '+requser.role+' are ::', work_Tels);
  var newWork_tels = [];
  work_Tels.map(function(obj){
    if (obj.bookingid && obj.conferenceConcluded == "no" && obj.conferenceWorkerConnected == "yes") {
      console.log('bookings inside if (obj.bookingid && obj.conferenceConcluded == "no" && obj.conferenceWorkerConnected == "yes")::');
      newObj = {}
      newObj.language = obj.language;
      newObj.bookingid = obj.bookingid;
      newObj.createdAt = obj.outboundSummary.createdAt;
      newWork_tels.push(newObj);
    }
  });
  newWork_tels.sort(function(aze,bze){return Date.parse(bze.createdAt) - Date.parse(aze.createdAt)});
  return newWork_tels;
})
.then(function(work_tels) {
  console.log('bookings inside the then work_tels for live bookingid ::', work_tels);
  res.send(work_tels);
})
.catch(function(err){
  // just need one of these
  console.log('bookings finding error:', err);
});
});// END router.get

router.get("/calls", function(req,res){
  var requser = req.user;
/**@todo find and send all works for this customer */
console.log('INSIDE get on work req.user._id:: ',req.user._id);
console.log('INSIDE get on work req.user:: ',req.user);
console.log(req.user._id);
var params = {};
if (requser.role == 'customer') {
  params = {customer_id: req.user._id}
} else if(requser.role == 'contractor') {
  params = {contractor_id: req.user._id}
} else if (requser.role == 'admin'){
  params = {}
}
console.log("== open tailable cursor");
// Work_Tel.find(params, {tailable:true, awaitdata:true, numberOfRetries:-1}).each(function(err, doc) {
//   console.log('new doc added to Work_Tel of customer req.user.email, doc', doc);
//   // send message to client
//   // if (doc.type == "message") {
//     // res.io.emit("message",doc);
//     res.io.to(req.user.socketID).emit('newTelWorkForSocket', doc);
//     res.send(doc);
//     // res.io.to(contractorSocketArray[0].socketID).emit('socketToYou', JSON.stringify(savedWork._id));
//   // }
// })
/*
const cursor = Work_Tel.find(params).cursor(); //, {tailable:true, awaitdata:true, numberOfRetries:-1}    .sort({ $natural: -1 })
var count = 0;
cursor.on('data', function(doc) {
  console.log('in cursor.on(data), doc::',count, doc);
  console.log('req.user.socketID::', req.user.socketID);
  var socketsids = req.user.socketID;
  if (doc.inboundSummary && doc.outboundSummary && doc.outboundSummary.createdAt && doc.money && doc.money.customerCost) {
        console.log('inside if (doc.inboundSummary && doc.outboundSummary && doc.money && doc.money.customerCost)::');
        socketsids.forEach(function(socketid){res.io.to(socketid).emit('newTelWorkForSocket', doc)});
  }
  count++;
});
cursor.on('end', function(doc) {
  console.log('in cursor.on(end), doc::', doc);
});
*/
var promised = Work_Tel.find(params).exec();
promised.then(function(work_Tels) {
  console.log('Work_Tels documents found for '+requser.role+' are ::', work_Tels);
  var newWork_tels = [];
  work_Tels.map(function(obj){
    if (obj.inboundSummary && obj.outboundSummary && obj.outboundSummary.createdAt && obj.money && obj.money.customerCost) {
      console.log('inside if (obj.inboundSummary && obj.outboundSummary && obj.money && obj.money.customerCost)::');
      newWork_tels.push(obj);
    }
  });
  return newWork_tels;
})
.then(function(work_tels) {
  console.log('inside the then work_tels::', work_tels);
  work_tels.sort(function(aze,bze){return Date.parse(bze.outboundSummary.createdAt) - Date.parse(aze.outboundSummary.createdAt)});
  console.log('after sorting by date work_tels::', work_tels);
  res.send(work_tels);
})
.catch(function(err){
  // just need one of these
  console.log('error:', err);
});
});// END router.get

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
        work.status = "Accepted";
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


router.post("/estimate", function(req,res){
  console.log('1 inside post on server req.user._id', req.body );
  work = req.body;
  var startDateTime = work.date;
  var endDateTime = work.endDateTime;

  //CALCULATE HOURLY CHARGE
  var workCostObject = workRatesTotal(work);
  // CALCULATE DURATION
  var a = moment(endDateTime);
  var b = moment(startDateTime);
  var workDuration  = a.diff(b, 'minutes');
  // console.log('workDuration',workDuration);

  // CALCULATE TOTAL APPOINTMENT COST
  var hourlyCharge = workCostObject.charge;
  var perMinuteCharge = hourlyCharge/60;
  console.log('perMinuteCharge', perMinuteCharge);
  timeCost = workDuration * perMinuteCharge;
  timeCost += .098687;
  workCostObject.durationMins = workDuration;
  console.log('timeCost', timeCost);
  workCostObject.durationCost = Math.round(timeCost, 2);
  console.log('workCostObject.durationCost', workCostObject.durationCost);


  //IS THIS SHORT NOTICE ?
  var a = moment(startDateTime);
  var b = moment();
  var hoursUntilAppointment  = a.diff(b, 'minutes');

  // IF YES, CALCULATE SHORT NOTICE FEE IF AN
  if (hoursUntilAppointment < 1440) { //1440 minutes = 24 hours
      workCostObject.shortNoticeFee = (20 / 100) * workCostObject.charge; // 20% of charge rate
  }else {
    workCostObject.shortNoticeFee = 0;
  }

  var finalCost = workCostObject.durationCost + workCostObject.shortNoticeFee;
  workCostObject.finalCost = Math.round(finalCost, 2);

  res.send(workCostObject);
});// END router.post


router.route("/complete")
.put(function(req, res) {
  console.log('INSIDE work/complete on server req.body:', req.body);
  Work.findById(req.body.id, function(err, work){
    console.log('INSIDE complete on server found work item:', work);
    if(err){
      console.log(err);
    }
    var date_now = Date.now();
    console.log('date_now::', date_now);

    work.work_signatures = {signature: req.body.sig,  date: date_now};
    work.status = 'completed';
    // save the work
    work.save(function(err, work) {
      console.log('WORK UPDATED WITH COMPLETE !!!!!!!', work);
      // postToPayable();
      // stripeChargePay(work);
      if (err)
      res.send(err);

      //find the Customer and charge them
      //find the Contractor and pay them
      // User.findById('574b41752ec3c13faacf20f1', function(err, contractor){
      //   console.log('INSIDE accept on server work.contractor_id contractor:', contractor);
      //   if(err){
      //     console.log(err);
      //   }
      //   console.log('contractor for epirts::',contractor);
      //
      //   stripe.charges.create({
      //     amount: 1500, // amount in cents, again
      //     currency: "usd",
      //     description: "Example charge for interpreting",
      //     customer: req.user.epirts.customerID, // Previously stored, then retrieved customer
      //     destination: contractor.epirts.id,
      //     application_fee: 700,
      //     metadata: {'work_id': work._id}
      //   }, function(err, charge) {
      //     console.log('charge::',charge);
      //     // Work.findById(req.body._id, function(err, work){
      //     //   console.log('INSIDE complete on server work:', work);
      //     //   if(err){
      //     //     console.log(err);
      //     //   }
      //     //   work.epirts.charge_id = charge.id;
      //     //   // save the work
      //     //   work.save(function(err, work) {
      //     //     console.log('WORK UPDATED WITH COMPLETE !!!!!!!');
      //     //     postToPayable();
      //     //     stripeChargePay(work);
      //     //     if (err)
      //     //     res.send(err);
      //     // });
      //     // });
      //     if (err && err.type === 'StripeCardError') {
      //       // The card has been declined
      //     }
      //
      //
      //   });
      // });

      // res.json({ message: 'WORK UPDATED WITH COMPLETE !!!!!!!' });
    });
  });
});


router.post("/mobileWork", function(req,res){
  console.log('INSIDE /mobileWork req.body: ',req.body.msg);
  console.log('INSIDE /mobileWork req.user: ',req.user);
  var user = req.user;
  var workid = req.body.msg;
  workid = workid.replace(/[^0-9a-zA-Z]/g, '');
  console.log('in /mobileWork workid::', workid);
  //FIND THE WORK AND SEND IT

  var promise = Work.findById(''+workid).exec();
  var date_now = Date.now();
  promise.then(function(work) {
    console.log('user._id::', user._id);
    console.log('work asdf::', work);
    work.notifications.push({user_id: user._id, datetime: date_now, action: ""});

    return work.save(); // returns a promise
  })
  .then(function(work) {
    console.log('updated work: ', work);
    res.send({id:"return from mobileWork", work: work});
    // do something with updated work
  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
  });



});


router.post("/", function(req, res, next){

  var newwork;
  var work = req.body;
  //GET contractor's estimate FEE
  var contractorEstimateFee = workPayTotal(work);
  var customerEstimateFee = workRatesTotal(work);

  console.log('contractorEstimateFee', contractorEstimateFee);

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
  details = req.body.details || {},
  customer_id = req.user._id,
  details = req.body.details,
  company = req.body.company || {},


  contractor_id = '',
  money = {},
  notifications = [],
  status = req.body.status,
  date_created = moment().toISOString();
  console.log('work date_created',date_created);

  // set work constant
  money.customer = {};
  money.contractor = {};

  money.customer.customer_estimate = customerEstimateFee;
  money.contractor.contractor_estimate = contractorEstimateFee;

  //set work pay
  console.log('2 inside post on server req.user._id', req.user );

// GET FORECAST FUNCTION

  var Forecast = require('forecast.io');
  var options = {
    APIKey: process.env.FORECAST_API_KEY, // a7477969f3764bd6cd2bf01efa7a7365
    timeout: 1000
  },
  forecast = new Forecast(options);
  var past = Math.round((new Date()).getTime() / 1000) - 57600;
  var time = datetime;
  var gettingForecast = function(geocodedData){
    console.log('geocodedData in gettingForecast::', geocodedData);
    var geocodedData = geocodedData.results[0].geometry.location;
    var geo = [];
    geo[0]=geocodedData.lat;
    geo[1]=geocodedData.lng;
    var lat = geo[0];
    var lon = geo[1];
    console.log('geo inside gettingForecast::', geo);
    //getting weather info with Forecast.io package
    var workdatetime =  datetime;
    console.log('workdatetime:' ,workdatetime);
    console.log('Date.create(workdatetime):' ,moment(workdatetime));
    console.log('moment(workdatetime).subtract(2, "hours"):', moment(workdatetime).subtract(2, 'hours'));
    workdatetime = moment(workdatetime).subtract(2, 'hours').unix();
    // unixtime = workdatetime.getTime();
    // unixtime = ""+unixtime;
    // unixtime = '2013-05-06T12:00:00-0400'; // '1461067200' or unixtime.slice(0, - 3);
    console.log(' (2).hoursBefore(workdatetime) in unixtime:' , workdatetime);
    var latLonTime = ""+geo[0]+","+geo[1]+","+workdatetime; //"34.6036,98.3959"
    console.log('geocodedData.lat::', geocodedData.lat);
    console.log('geocodedData.lng::', geocodedData.lng);
    console.log('datetime::', datetime);

    return new Promise(function (resolve, reject){
      forecast.getAtTime(geocodedData.lat, geocodedData.lng, datetime, function (err, res, data) {

        console.log('H E L L O data inside forecast.js: ', data);
        var weatherNgeo = {};
        weatherNgeo.geo = geo;
        weatherNgeo.workWeather = [];
        weatherNgeo.workWeather.push(data);
        console.log('weatherNgeo inside forecast.getAtTime::', weatherNgeo);
        if (err) reject(err);
        else resolve(weatherNgeo)
      });//END forecast.getAtTime
    });
  }//END var gettingForecast

  var saveWork = function(weatherNgeo){

    console.log('weatherNgeo in saveWork::', weatherNgeo);
    var workWeather = weatherNgeo.workWeather;
    var geo = weatherNgeo.geo;
    var work_signatures = {};
    var shrtid = shortid.generate();
    var addedWork = new Work({"company" : company, "shortid" : shrtid, "work_signatures" : work_signatures, "money" : money, "date_created" : date_created, "type" : type, "datetime" : datetime, "endTime" : endTime,  "address" : address, "details" : details, "status" : status, "customer_id" : customer_id, "contractor_id" : contractor_id, "geo" : geo, "weather" : workWeather });
    // newwork = addedWork;
    return new Promise(function (resolve, reject){
      addedWork.save(function(err, data){
        if (err) reject(err);
        else resolve(data)
      });//END addedWork.save
    });
  }

  // Geocode item work
  // var geocodeWorkAddress = function(){
  //   console.log('address in geocodeWorkAddress::', address);
  //   geocoder.geocode(address, function ( err, geocodedData ) {
  //     if (err) {
  //       console.log('err in geocode', err);
  //     }
  //     var geocodedData = geocodedData.results[0].geometry.location;
  //     return geocodedData;
  //   });//END geocoder.geocode
  // }

var geocodeWorkAddress = function(){
  return new Promise(function (resolve, reject){
    geocoder.geocode(address, function ( err, geocodedData ) {
      if (err) reject(err);
      else resolve(geocodedData)
      // var geocodedData = geocodedData.results[0].geometry.location;
      // return geocodedData;
    });//END geocoder.geocode
  });
};


geocoder.geocodeAsync = function (string, options) {
    return Promise.fromCallback(function (callback) {
        geocoder.geocode(string, callback, options);
    });
};

// var geocodeWorkAddress2 = Promise.promisify(geocoder.geocode());

    // var geocodeWorkAddress = geocoder.geocode(address, function ( err, geocodedData ) {
    //   // if (err) reject(err);
    //   // else resolve(geocodedData)
    //   // var geocodedData = geocodedData.results[0].geometry.location;
    //   // return geocodedData;
    // });//END geocoder.geocode

// io.to(socket.id).emit("event", data);
// var startGeocode = geocodeWorkAddress();

// startGeocode(address).then(function(geocodedData) {
//     return eval(contents);
// }).then(function(result) {
//     console.log("The result of evaluating myfile.js", result);
// }).catch(SyntaxError, function(e) {
//     console.log("File had syntax error", e);
// //Catch any other error
// }).catch(function(e) {
//     console.log("Error reading file", e);
// });

// var startGeocode = BlueBirdPromise.promisify(geocodeWorkAddress());

geocoder.geocodeAsync(address).then(function(geocodedData) {
  console.log('geocodedData::', geocodedData);
    // Get Forecast
    return gettingForecast(geocodedData);
  }).then(function(weatherNgeo){
    console.log('weatherNgeo::', weatherNgeo);
    // Save work
    return saveWork(weatherNgeo);
  }).then(function(savedWork){
    console.log('savedWork::', savedWork);
    // Alert Contractors via Email and SMS
    return newWorkAlert(savedWork); //return contractorSocketArrayWorkObject
  })
  .then(function(contractorSocketArrayWorkObject){
    console.log('contractorSocketArrayWorkObject::', contractorSocketArrayWorkObject);
    console.log('contractorSocketArrayWorkObject::.savedWork', contractorSocketArrayWorkObject.savedWork);
    console.log('contractorSocketArrayWorkObject.contractorSocketArray::', contractorSocketArrayWorkObject.contractorSocketArray);
    var savedWork = contractorSocketArrayWorkObject.savedWork;
    var contractorSocketArray = contractorSocketArrayWorkObject.contractorSocketArray;
    console.log('contractorSocketArray[0].socketID::', contractorSocketArray[0].socketID);
    // Alert Contractors via socketID
    // res.io.emit("socketToYou", savedWork);
    // savedWork = JSON.stringify(savedWork);
    console.log('savedWork::', savedWork);
    console.log('savedWork._id::', savedWork._id);
    var workitem = [];
    workitem.push({username:savedWork});
    // socket.emit('login', {userList: userList})
    res.io.to(contractorSocketArray[0].socketID).emit('socketToYou', JSON.stringify(savedWork._id));
    res.send(savedWork);
  })
  // .then(function(arrayOfContractorSocketIDs){
  //   // Emit to Contractors
  //   res.io.emit("socketToYou", savedWork);
  //   res.send(savedWork);
  // }).then(function(savedWork){
  //   // Send Response
  //   res.io.emit("socketToYou", savedWork);
  //   res.send(savedWork);
  // })
  .catch(function(err){
    console.log('err in .catch in work.js::', err);
    next(err);
  });

});// END router.post

// router.get("/", function(req, res, next){
//     Promise.try(function(){
//         return doSomeAsyncThing();
//     }).then(function(value){
//         return doAnotherAsyncThing(value);
//     }).then(function(newValue){
//         res.send("Done!");
//     }).catch(function(err){
//         next(err);
//     });
// });


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
      }).where('type').equals(req.user.type).where('status').equals('pending');    //.where('status').ne('Accepted');
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

router.use("/work-accept/:id", function(req,res){
  console.log('INSIDE /work-accept/:id req.params: ',req.params);
  console.log('INSIDE /work-accept/:id req.user: ',req.user);

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
    .get(function(req,res){
        console.log("Inside get /:id on server: ",  req.params.id);
        Work.findById(req.params.id, function(err, work){
            if(err){
              console.log(err);
            }
            console.log('work in /:id get::', work);
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

router.get("/", function(req,res){
/**@todo find and send all works for this customer */
console.log('INSIDE get on work req.user._id: ',req.user._id);
var requser = req.user;

if (requser.role == 'customer') {
  var promised = Work.find({customer_id: req.user._id}).where('status').ne('canceled').exec();
} else if(requser.role == 'contractor') {
  var promised = Work.find({contractor_id: req.user._id}).where('status').ne('canceled').exec();
} else if (requser.role == 'admin'){
  var promised = Work.find({}).limit(150).exec();
}
promised.then(function(works) {
  console.log('Works documents found for '+requser.role+' are ::', works);
  console.log('inside the then works.length::', works.length);
  res.send(works);
  // return works;
})
.then(function(works) {
  // console.log('inside the then works.length::', works.length);
  // res.send(works);
})
.catch(function(err){
  // just need one of these
  console.log('error:', err);
});


/*
if (requser.role === 'customer' || requser.role === 'contractor'){
  Work.find(function (err, work) {
        if (err) {
          console.log('err::', err);
        } else if (work) {
          console.log('work::', work);
          console.log('work[1]::', work[1]);
          res.send(work);
        } else {
          //nothing
        }
      }).or([{ customer_id: ''+req.user._id }, { contractor_id: ''+req.user._id }]).where('status').ne('canceled');
} else if (requser.role === 'admin') {
  Work.find(function (err, work) {
        if (err) {
          console.log('err::', err);
        } else if (work) {
          console.log('work::', work);
          console.log('work[1]::', work[1]);
          res.send(work);
        } else {
          //nothing
        }

        // var resSend = function(){
        //   console.log('workArray :', workArray);
        //   res.send(workArray);
        // };
      });
}
*/

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





module.exports = router;
