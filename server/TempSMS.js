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
