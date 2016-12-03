// var configsty = require('config-node');
// var db = require('../modules/db');//#AGENDA
// var Agenda = require('agenda');//#AGENDA
// var mongoose = require("mongoose");
// var Schema = mongoose.Schema;
// var work = require('../routes/work');//#AGENDA
//
//
//
// var mongoURI =
//   configsty.MONGOLAB_URI ||
//   configsty.MONGOHQ_URL ||
//   'mongodb://localhost/work';
// var Work = mongoose.model("Works");
//
//
// var agenda = new Agenda({db: {address: mongoURI}});
//
// var acceptedWorkReminder = function(acceptedWork){
//   var  contractorFname,
//   contractorLname,
//   contractorEmail;
//   console.log('INSIDE acceptedWorkReminder acceptedWork:', acceptedWork);
//
//   /**@todo QUERY FOR ASSIGNED CONTRACTOR on acceptedWork, GET THEIR PHONE AND EMAIL-- */
//   Work.findById(acceptedWork.contractor_id, function(err, contractor){
//     console.log('INSIDE complete on server work:', contractor);
//     if(err){
//       console.log(err);
//     }
//     /*Schedule for email(rightaway) -- */
//     agenda.define('send emailNotification', function(job, done) {
//       console.log('I sent emailNotification rightaway');
//       emailNotification(contractor)
//       done();
//     });
//     /*Schedule for PhoneCall(24hours) -- */
//     agenda.define('send phoneReminder', function(job, done) {
//       console.log('I sent phoneReminder in t - 24hours');
//       phoneReminder(contractor);
//       done();
//     });
//     /*Schedule for SMS(2hours),-- */
//     smsReminder(contractor);
//     agenda.define('send smsReminder', function(job, done) {
//       console.log('I sent smsReminder in t - 2 hours');
//       phoneReminder(contractor);
//       done();
//     });
//     /*Activate all the notifications,-- */
//     agenda.on('ready', function() {
//       agenda.schedule('now', 'send emailNotification');
//       agenda.schedule('in 1 minutes', 'send phoneReminder');
//       agenda.schedule('in 2 minutes', 'send smsReminder');
//       agenda.start();
//     });
//   });
//
// var emailNotification = function(contractor){
//   contractorFname = contractor.fname;
//   contractorLname = contractor.lname;
//   contractorEmail = contractor.email;
//   var nodemailer = require('nodemailer');
//   // create reusable transporter object using the default SMTP transport
//   var transporter = nodemailer.createTransport('smtps://modespeaking%40gmail.com:gwtexvqycbstxzvf@smtp.gmail.com');
//   // setup e-mail data with unicode symbols
//   var mailOptions = {
//     from: '"Mode Speak 👥" <modespeaking@gmail.com>', // sender address
//     to: contractorEmail, // list of receivers
//     subject: 'Hello ✔', // Subject line
//     text: 'Hello '+ contractorFname +'  '+ contractorLname +'🐴 This is confirmation that you have accepted the following work assignment. TYPE: '
//     +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime, // plaintext body
//     html: '<b>Hello '+ contractorFname +'  '+ contractorLname +' 🐴 This is confirmation that you have accepted the following work assignment. TYPE: '
//     +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime+"</b>" // html body
//   };
//   // send mail with defined transport object
//   transporter.sendMail(mailOptions, function(error, info){
//     if(error){
//       return console.log(error);
//     }
//     console.log('Message sent: ' + info.response);
//   });
// }
// var smsReminder = function(contractor){
//   contractorFname = contractor.fname;
//   contractorLname = contractor.lname;
//   contractorEmail = contractor.email;
//   //SMS
//   var twilio = require('twilio'),
//   client = twilio('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c'); //twilio('ACCOUNTSID', 'AUTHTOKEN'),
//
//   client.sendMessage({
//     to: phoneNumber,
//     from:'6122844292',
//     body:'Hello '+contractorFname+'  '+contractorLname+' 🐴 This is a remider of your upcoming appointment: '
//     +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime }, function( err, data ) {
//     });
//   }
// }
// var phoneReminder =  function(contractor){
//   contractorFname = contractor.fname;
//   contractorLname = contractor.lname;
//   contractorEmail = contractor.email;
//   //BEGIN CALL
//   client = twilio('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c'); //twilio('ACCOUNTSID', 'AUTHTOKEN'),
//   client.calls.create({
//     url: "https://enigmatic-lowlands-90835.herokuapp.com/phoneCall/?user_id=12345", //"https://enigmatic-lowlands-90835.herokuapp.com/phoneCall.xml" "twiml" "http://demo.twilio.com/docs/voice.xml" "http://localhost:5005/public/assets/scripts/twiml.xml" "http://localhost/public/assets/scripts/twiml.xml" "http://twimlbin.com/0e4f056c3572ca5bc51f86e9f8e7d962"
//     to: "+16128121238", //+16122671744  "+16128121238" "+16129631395 Dev" 8023561672 Tommy
//     from: "+17637102473",  //+17637102473  16122844292
//     method: "GET"
//   }, function(err, call) {
//     console.log('This call\'s unique ID is: ' + call.sid);
//     console.log('This call was created at: ' + call.dateCreated);
//     process.stdout.write(call.sid);
//     console.log('Received call from: ' + call.from);
//   }); //END CALL
// };
//
// module.exports = acceptedWorkReminder;
