// var express = require("express");
// var router = express.Router();
// var path = require("path");
// var bodyParser = require("body-parser");
// var mongoose = require("mongoose");
// var Schema = mongoose.Schema;
// var Forecast = require('forecast');//not using
// var darksky = require('darksky');//not using
// var geocoder = require('geocoder');
// var restler = require('restler');
// var sugar = require('sugar');
// var Agenda = require('agenda');//#AGENDA
// //MODELS
// var User = require("./models/user");
// var User = require("./models/work");
// var User = require("./models/contractor");
//
// // ---- Modules ---- //
// var newWorkAlert = require('../modules/newWorkAlert');
// // var acceptedWorkReminder = require('../modules/acceptedWorkReminder');
//
// /**@todo export db connection and schemas so as to avoid duplication*/
// var mongoURI =
//   process.env.MONGOLAB_URI ||
//   process.env.MONGOHQ_URL ||
//   'mongodb://localhost/work';
//
// mongoose.model("Works", new Schema({
//   "type" : String, "datetime" : String, "endTime" : String,
// "address" : String, "details" : String, "customer_id" : String, "status" : String, "contractor_id" : String, "geo": {
//     type: [Number],
//     index: '2d'
//   }
// }));
//
// mongoose.model("Contractors", new Schema({
//   "fname" : String, "lname" : String, "type" : String, "phone" : String, "email" : String,
// "address" : String, "geo": {
//     type: [Number],
//     index: '2d'
//   }
// }));
//
// var Work = mongoose.model("Works");
//
// var Contractor = mongoose.model("Contractors");
//
//
// router.route("/accept/")
//     .put(function(req, res) {
//       console.log('INSIDE work/accept on server req.body._id:', req.body._id);
//       Work.findById(req.body._id, function(err, work){
//         console.log('INSIDE accept on server work:', work);
//         if(err){
//           console.log(err);
//         }
//         work.contractor_id = req.body.contractor_id;
//         work.status = req.body.status;
//         // save the work
//         work.save(function(err) {
//           if (err)
//           res.send(err);
//           console.log('2nd INSIDE accept after save on server work:', work);
//           // res.json({ message: 'work updated with accept!' });
//
//         Contractor.findById(work.contractor_id, function(err, contractor){
//           console.log('INSIDE accept on server work.contractor_id contractor:', contractor);
//           if(err){
//             console.log(err);
//           }
//             acceptedWorkReminder(work, contractor);
//             // res.json({ message: 'work updated with accept!' });
//           });
//
//       });
//     });
//   });
//
// router.route("/complete")
// .put(function(req, res) {
//   console.log('INSIDE work/complete on server req.body:', req.body._id);
//   Work.findById(req.body._id, function(err, work){
//     console.log('INSIDE complete on server work:', work);
//     if(err){
//       console.log(err);
//     }
//     work.status = 'complete';
//     // save the work
//     work.save(function(err) {
//       if (err)
//       res.send(err);
//       res.json({ message: 'work updated with accept!' });
//     });
//   });
// });
//
//
//
// router.post("/", function(req,res){
//   var type = req.body.type,
//       datetime = req.body.datetime,
//       endTime = req.body.endTime,
//       address = req.body.address,
//       details = req.body.details,
//       customer_id = req.body.customer_id,
//       contractor_id = '',
//
//       status = req.body.status;
// // Geocode and save work to database
//       geocoder.geocode(address, function ( err, geocodedData ) {
//         var geocodedData = geocodedData.results[0].geometry.location;
//         var geo = [];
//             geo[0]=geocodedData.lat;
//             geo[1]=geocodedData.lng;
// // saving geocoded address to the database
//         var addedWork = new Work({"type" : type, "datetime" : datetime, "endTime" : endTime,  "address" : address, "details" : details, "status" : status, "customer_id" : customer_id, "contractor_id" : contractor_id, geo : geo });
//         addedWork.save(function(err, data){
//             if(err){
//               console.log(err);
//               console.log('data (new work item created inside addWork.save) ',data);
//             }
//             newWorkAlert(addedWork);
//             res.send(data);
//         });
//       });
// /**@todo find all contractors nearby who match work.type then alert them via 1) Email, 2) SMS */
//         // //qury for nearby locations -- this code works
//         // var distance = 1000 / 6371;
//         // var query = Work.find({'geo': {
//         //   $near: [
//         //     44.969220, //req.body.lat,
//         //     -93.273994 //req.body.lng
//         //   ],
//         //   $maxDistance: distance
//         //   }
//         // });
//         // query.exec(function (err, work) {
//         //   console.log('work inside query.exec', work);
//         //   if (err) {
//         //     console.log(err);
//         //     throw err;
//         //   }
//         //   if (!work) {
//         //     console.log('Found did not find any matching item : ' + work);
//         //     res.json({});
//         //   } else {
//         //     console.log('Found matching item: ' + work);
//         //     res.json(work);
//         //  }
//         // });
//         // //end of query
//
// });
//
//
// router.get("/", function(req,res){
// /**@todo find and send all works for this customer */
//
// Work.find(function (err, work) {
//       if (err) {
//         res.send(err, null);
//       }
//       res.send(work);
//     });
//
// });
//
// router.route("/:id")
//     .delete(function(req,res){
//         // console.log("Inside delete on server: ",  req.params.id);
//         Work.findByIdAndRemove(req.params.id, function(err, work){
//             if(err){
//               console.log(err);
//             }
//             res.send(work);
//         });
//     })
//     // update the work with this id (accessed at PUT http://localhost:8080/api/works/:work_id)
//     .put(function(req, res) {
//       console.log('INSIDE cancel on server req.params.id:', req.params.id);
//       Work.findById(req.params.id, function(err, work){
//       console.log('INSIDE cancel on server work:', work);
//
//           if(err){
//             console.log(err);
//           }
//           work.status = 'canceled';
//           // save the work
//             work.save(function(err) {
//                 if (err)
//                     res.send(err);
//           res.json({ message: 'work updated!' });
//       });
//     });
//   });
//
//
// var acceptedWorkReminder =  function(work, contractor){
//   var agenda = new Agenda({db: {address: mongoURI}});
//
//     var  contractorFname,
//     contractorLname,
//     contractorEmail;
//     console.log('INSIDE acceptedWorkReminder acceptedWork:', acceptedWork);
//
//       agenda.define('send emailNotification', function(job, done) {
//         console.log('I sent emailNotification rightaway');
//         emailNotification(work, contractor)
//         done();
//       });
//       /*Schedule for PhoneCall(24hours) -- */
//       agenda.define('send phoneReminder', function(job, done) {
//         console.log('I sent phoneReminder in t - 24hours');
//         phoneReminder(work, contractor);
//         done();
//       });
//       /*Schedule for SMS(2hours),-- */
//       agenda.define('send smsReminder', function(job, done) {
//         console.log('I sent smsReminder in t - 2 hours');
//         smsReminder(work, contractor);
//         done();
//       });
//       /*Activate all the notifications,-- */
//       agenda.on('ready', function() {
//         agenda.schedule('now', 'send emailNotification');
//         agenda.schedule('in 1 minutes', 'send phoneReminder');
//         agenda.schedule('in 2 minutes', 'send smsReminder');
//         agenda.start();
//       });
//     }
//
//   var emailNotification = function(work, contractor){
//     contractorFname = contractor.fname;
//     contractorLname = contractor.lname;
//     contractorEmail = contractor.email;
//     var nodemailer = require('nodemailer');
//     // create reusable transporter object using the default SMTP transport
//     var transporter = nodemailer.createTransport('smtps://modespeaking%40gmail.com:gwtexvqycbstxzvf@smtp.gmail.com');
//     // setup e-mail data with unicode symbols
//     var mailOptions = {
//       from: '"Mode Speak 👥" <modespeaking@gmail.com>', // sender address
//       to: contractorEmail, // list of receivers
//       subject: 'Hello ✔', // Subject line
//       text: 'Hello '+ contractorFname +'  '+ contractorLname +'🐴 This is confirmation that you have accepted the following work assignment. TYPE: '
//       +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime, // plaintext body
//       html: '<b>Hello '+ contractorFname +'  '+ contractorLname +' 🐴 This is confirmation that you have accepted the following work assignment. TYPE: '
//       +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime+"</b>" // html body
//     };
//     // send mail with defined transport object
//     transporter.sendMail(mailOptions, function(error, info){
//       if(error){
//         return console.log(error);
//       }
//       console.log('Message sent: ' + info.response);
//     });
//   }
//   var smsReminder = function(work, contractor){
//     contractorFname = contractor.fname;
//     contractorLname = contractor.lname;
//     contractorEmail = contractor.email;
//     //SMS
//     var twilio = require('twilio'),
//     client = twilio('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c'); //twilio('ACCOUNTSID', 'AUTHTOKEN'),
//
//     client.sendMessage({
//       to: phoneNumber,
//       from:'6122844292',
//       body:'Hello '+contractorFname+'  '+contractorLname+' 🐴 This is a remider of your upcoming appointment: '
//       +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime }, function( err, data ) {
//       });
//     }
//
//   var phoneReminder =  function(work, contractor){
//     contractorFname = contractor.fname;
//     contractorLname = contractor.lname;
//     contractorEmail = contractor.email;
//     //BEGIN CALL
//     client = twilio('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c'); //twilio('ACCOUNTSID', 'AUTHTOKEN'),
//     client.calls.create({
//       url: "https://enigmatic-lowlands-90835.herokuapp.com/phoneCall/?user_id=12345", //"https://enigmatic-lowlands-90835.herokuapp.com/phoneCall.xml" "twiml" "http://demo.twilio.com/docs/voice.xml" "http://localhost:5005/public/assets/scripts/twiml.xml" "http://localhost/public/assets/scripts/twiml.xml" "http://twimlbin.com/0e4f056c3572ca5bc51f86e9f8e7d962"
//       to: "+16128121238", //+16122671744  "+16128121238" "+16129631395 Dev" 8023561672 Tommy
//       from: "+17637102473",  //+17637102473  16122844292
//       method: "GET"
//     }, function(err, call) {
//       console.log('This call\'s unique ID is: ' + call.sid);
//       console.log('This call was created at: ' + call.dateCreated);
//       process.stdout.write(call.sid);
//       console.log('Received call from: ' + call.from);
//     }); //END CALL
//   };
// }
//
//
//
// module.exports = router;
