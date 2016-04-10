var twilio = require('twilio');
var client = require('twilio')('AC266d44c5ce01697df6f475b34f850d8f', 'ee3db5ce904dd188912ea24b1646b46c');

//START OF CALL MENU ROUTING CALL
client.makeCall({
  url: 'http://0a750e6f.ngrok.io/ivr/welcome',
  to: '+16128121238', //16127470372
  from: '+17637102473',
  // method: 'GET',
  statusCallback: 'http://0a750e6f.ngrok.io/events',
  statusCallbackMethod: 'POST',
  statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
}, (err, call) => {
  if(err) { console.log(err); return err; }
  process.stdout.write(call.sid);
});
//END OF CALL MENU ROUTING CALL


// // USE THIS BELOW TO CAL THE voice route and read the user's id from the url to get their info from the database
//START OF CALL GET URL WITH PARAMS FOR USER IDENTIFICATION
// client.makeCall({
//   url: 'http://0a750e6f.ngrok.io/voice/?user_id=12345',
//   to: '+16128121238', //16127470372
//   from: '+17637102473',
//   method: 'GET',
//   statusCallback: 'http://37d1710d.ngrok.io/events',
//   statusCallbackMethod: 'POST',
//   statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
// }, (err, call) => {
//   if(err) { console.log(err); return err; }
//   process.stdout.write(call.sid);
// });
//END OF CALL GET URL WITH PARAMS FOR USER IDENTIFICATION
