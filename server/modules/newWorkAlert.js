var mongoose = require("mongoose");
var Promise = require('bluebird');
// set Promise provider to bluebird
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;
// var User = require('../models/user');
// var Contractor = require('../models/contractor');
var User = require('../models/user');
var Work = require('../models/work');


var newWorkAlert = function(addedWork){
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
        +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime+" Click here to accept: "+process.env.APP_URL+'/work/work-accept/'+addedWork.shortid, // plaintext body
        html: '<b>Hello '+ contractorFname +'  '+ contractorLname +' 🐴 New work availible. TYPE: '
        +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime+" Click here to accept: "+process.env.APP_URL+'/work/work-accept/'+addedWork.shortid+"</b>" // html body
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
    console.log('NUMBER OF CONTRACTORS TO SMS AND EMAIL: ',contractors.length);
    for (var i = 0; i < contractors.length; i++) {
          contractorFname = contractors[i].firstname;
          contractorLname = contractors[i].lastname;
          contractorEmail = contractors[i].email;

      //SMS
      var accountSid = 'AC266d44c5ce01697df6f475b34f850d8f';
      var authToken = "ee3db5ce904dd188912ea24b1646b46c"; //"{{ auth_token }}";
      var client = require('twilio')(accountSid, authToken);
        // console.log('addedWork.shrtid', addedWork.shortid);
      client.messages.create({
          body: 'Hello '+ contractorFname +'  '+ contractorLname +'🐴 New work availible. TYPE: '
          +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime+" Click here to accept: "+process.env.APP_URL+'/work/work-accept/'+addedWork.shortid, // plaintext body
          html: '<b>Hello '+ contractorFname +'  '+ contractorLname +' 🐴 New work availible. TYPE: '
          +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime+" Click here to accept: "+process.env.APP_URL+'/work/work-accept/'+addedWork.shortid+"</b>", // html body
          to: "+16128121238",
          from: "+16122844292"
      }, function(err, message) {
          process.stdout.write(message.sid);
      }); //End client.messages.create function
  }//End forloop
}//End sendSMS function
return new Promise(function (resolve, reject){

  var  contractorFname,
       contractorLname,
       contractorEmail;
  console.log('INSIDE newWorkAlert addedWork:', addedWork);

  // /**@todo FIND CONTRACTORS NEAR WORK -- done*/
  // //qury for nearby locations -- this code works
  var matchingContractors;
console.log('addedWork.type::', addedWork.type);
      var distance = 1120/3963.2; //distance to radians: divide the distance by the radius of the sphere (e.g. the Earth) in the same units as the distance measurement. The equatorial radius of the Earth is approximately 3,963.2 miles or 6,378.1 kilometers.
      //https://docs.mongodb.com/manual/reference/operator/query/near/#op._S_near
      //https://docs.mongodb.com/manual/tutorial/calculate-distances-using-spherical-geometry-with-2d-geospatial-indexes/
      console.log('distance::', distance);
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
          console.log(' inside query.exec contractors nearby blah: ', contractors);
          if (err) reject(err); //first half of resolving the promise
          if (contractors.length < 1) {
            console.log('Did not find any matching item : ' , contractors);
            // res.json({});
          } else {
            // console.log('Found matching contractors: ' + contractors);
            // res.json(contractors);
            sendSMS(contractors);
            sendEmail(contractors);
            var contractorSocketArrayWorkObject = {};
                contractorSocketArrayWorkObject.contractorSocketArray = contractors;
                contractorSocketArrayWorkObject.savedWork = addedWork;
            console.log('contractorSocketArrayWorkObject::', contractorSocketArrayWorkObject);

            resolve(contractorSocketArrayWorkObject); //second half of resolving the promise

            }
        });//end of query
      });
  // /*@todo get their phone number and email address
  // /*@todo send them sms and email with work details*/



}//End var newWorkAlert function


module.exports = newWorkAlert;
