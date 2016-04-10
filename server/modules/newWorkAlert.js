var newWorkAlert = function(addedWork){

   console.log('INSIDE newWorkAlert addedWork:', addedWork);
  //
  // /**@todo FIND CONTRACTORS NEAR WORK*/
  // //qury for nearby locations -- this code works
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
  // /*@todo get their phone number and email address
  //
  // /*@todo send them sms and email with work details*/
  //
  // //ALL OF THE CODE BELOW WORKS...COMMENTED OUT TO TEST GEOCODER ABOVE
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
  //   //SMS
  //   var twilio = require('twilio'),
  //   client = twilio('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c'); //twilio('ACCOUNTSID', 'AUTHTOKEN'),
  //   // var cronJob = require('cron').CronJob;
  //
  //   // var textJob = new cronJob( '33 5 * * *', function(){ // represents 33 minutes past 5am
  //   //   client.sendMessage( {
  //   //     to:'6128121238',
  //   //     from:'7637102473',
  //   //     body:'Hello! Hope you’re having a good day!' }, function( err, data ) {
  //   //     });
  //   // },  null, true);
  //
  //   // client.sendMessage({
  //   //   to:'6128121238',
  //   //   from:'6122844292',
  //   //   body:'Hello! Hope you’re having a good day!' }, function( err, data ) {
  //   //   });
}

module.exports = newWorkAlert;
