//part of my work app ... this is tempt storeage

// Your accountSid and authToken from twilio.com/user/account
var accountSid = 'AC32a3c49700934481addd5ce1659f04d2';
var authToken = "{{ auth_token }}";
var client = require('twilio')(accountSid, authToken);

client.messages.create({
    body: "Jenny please?! I love you <3",
    to: "+14159352345",
    from: "+14158141829"
}, function(err, message) {
    process.stdout.write(message.sid);
});

//SMS
      var twilio = require('twilio'),
      client = twilio('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c'); //twilio('ACCOUNTSID', 'AUTHTOKEN'),

      client.sendMessage({
        to: phoneNumber,
        from:'6122844292',
        body:'Hello '+contractorFname+'  '+contractorLname+' 🐴 New work availible. TYPE: '
        +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime }, function( err, data ) {
        });


//Second version
var sendSMS = function(phoneNumber){
    // Twilio Credentials
    var accountSid = 'AC266d44c5ce01697df6f475b34f850d8f';
    var authToken = 'ee3db5ce904dd188912ea24b1646b46c';
    //require the Twilio module and create a REST client
    var client = require('twilio')(accountSid, authToken);
    client.messages.create({
      to: phoneNumber,
      from: "+16122844292",
      body:'Hello '+contractorFname+'  '+contractorLname+' 🐴 New work availible. TYPE: '
        +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime,
      // mediaUrl: "https://climacons.herokuapp.com/clear.png"
    }, function(err, message) {
      console.log('message.sid:',message);
    });
  }//End of sendSMS function



// send reminder sms in work.js (i'm storing here old version as I am replacing)
var smsReminder = function(addedWork, contractor){
  console.log('inside smsReminder contractor:',contractor)
  contractorFname = contractor.fname;
  contractorLname = contractor.lname;
  contractorEmail = contractor.email;
  contractorPhone = contractor.phone;

  //SMS


  client.sendMessage({
    to: contractorPhone,
    from:'6122844292',
    body:'Hello '+contractorFname+'  '+contractorLname+' 🐴 This is a remider of your upcoming appointment: '
    +addedWork.type +' ADDRESS: '+ addedWork.address +' DATE & START TIME: '+addedWork.datetime +' ENDTIME: '+addedWork.endTime }, function( err, data ) {
    });
  }


  //TEMP SERVER CODE
  var contractorOrCustomer = function(req, res){
    console.log('req.user.role:', req.user);
    if (req.user.role == 'contractor'){
        var obj =  {
            successRedirect: "/assets/views/contractors.html",
            failureRedirect: "/"
        }
      return  obj;
    }else if (req.user.role == 'customer') {
      var obj =  {
          successRedirect: "/assets/views/customers.html",
          failureRedirect: "/"
      }
      return  obj;
    }
  }

  //write post here
  router.post("/", function(req,res,next){
    console.log('req.user.role:', req.user);
    if (req.user.role == 'contractor'){
      passport.authenticate("local",
  }); passport.authenticate("local", contractorOrCustomer(req,res)));


  //Second version
  router.post("/", function(req,res,next){
    console.log('req.user.role:', req);
    if (req.user.role == 'contractor'){
      passport.authenticate("local", {
          successRedirect: "/assets/views/contractors.html",
          failureRedirect: "/"
      });
    }else if (req.user.role == 'customer') {
      passport.authenticate("local", {
          successRedirect: "/assets/views/customers.html",
          failureRedirect: "/"
      });
    }
  });
