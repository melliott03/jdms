var mongoose = require("mongoose");
var Schema = mongoose.Schema;
// var User = require('../models/user');
// var Contractor = require('../models/contractor');
var User = require('../models/user');
var Work = require('../models/work');


var newWorkAlert = function(addedWork){
  var  contractorFname,
       contractorLname,
       contractorEmail;
       console.log('INSIDE contractor_rate.js addedWork:', addedWork);

  // /**@todo FIND CONTRACTORS NEAR WORK -- done*/
  // //qury for nearby locations -- this code works
  var matchingContractors;

      var distance = 1000 / 3963.2;
      var query = User.find({'geo': {
        $near: [
          addedWork.geo[0],
          addedWork.geo[1]
        ],
        $maxDistance: distance
        }
        /**@todo figureout how to compair where contractor.type equals addedWork.type*/
      }).where('type').equals(addedWork.type);
      query.exec(function (err, contractors) {
        console.log(' inside query.exec contractors nearby : ', contractors);
        if (err) {
          console.log(err);
          throw err;
        }
        if (!contractors) {
          console.log('Found did not find any matching item : ' + contractors);
          res.json({});
        } else {
          // console.log('Found matching contractors: ' + contractors);
          // res.json(contractors);
          sendSMS(contractors);
          sendEmail(contractors);
       }
      });
      //end of query

  // /*@todo get their phone number and email address
  // /*@todo send them sms and email with work details*/

  var sendEmail = function(contractors){
    var nodemailer = require('nodemailer');

    for (var i = 0; i < contractors.length; i++) {
          contractorFname = contractors[i].firstname;
          contractorLname = contractors[i].lastname;
          contractorEmail = contractors[i].email;

      // create reusable transporter object using the default SMTP transport
      var transporter = nodemailer.createTransport('smtps://modespeaking%40gmail.com:gwtexvqycbstxzvf@smtp.gmail.com');
      // setup e-mail data with unicode symbols
      var mailOptions = {
        from: '"Mode Speak 👥" <modespeaking@gmail.com>', // sender address
        to: contractorEmail, // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello '+ contractorFname +'  '+ contractorLname +'🐴 New work availible. TYPE: '
        +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime, // plaintext body
        html: '<b>Hello '+ contractorFname +'  '+ contractorLname +' 🐴 New work availible. TYPE: '
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
  }//End sendEmail function

  var sendSMS = function(contractors){
    console.log('NUMBER OF CONTRACTORS TO SMS AND EMAIL: ',contractors.length + 1);
    for (var i = 0; i < contractors.length; i++) {
          contractorFname = contractors[i].firstname;
          contractorLname = contractors[i].lastname;
          contractorEmail = contractors[i].email;

      //SMS
      var accountSid = 'AC266d44c5ce01697df6f475b34f850d8f';
      var authToken = "ee3db5ce904dd188912ea24b1646b46c"; //"{{ auth_token }}";
      var client = require('twilio')(accountSid, authToken);

      client.messages.create({
          body: 'Hello '+ contractorFname +'  '+ contractorLname +'🐴 New work availible. TYPE: '
          +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime, // plaintext body
          html: '<b>Hello '+ contractorFname +'  '+ contractorLname +' 🐴 New work availible. TYPE: '
          +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime+"</b>", // html body
          to: "+16128121238",
          from: "+16122844292"
      }, function(err, message) {
          process.stdout.write(message.sid);
      }); //End client.messages.create function
  }//End forloop
}//End sendSMS function
}//End var newWorkAlert function

module.exports = newWorkAlert;
