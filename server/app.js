require('dotenv').load();//Twilio Video
var express = require("express");
var app = express();
var db = require("./modules/db");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var http = require ('http');
var path = require('path');//Twilio Video
var AccessToken = require('twilio').AccessToken;//Twilio Video
var ConversationsGrant = AccessToken.ConversationsGrant;//Twilio Video
// var randomUsername = require('./randos');//Twilio Video
var User = require('./models/user');
var Work = require('./models/work');
var sugar = require('sugar');


app.use(express.static(path.join(__dirname, 'public')));//Twilio Video


//PASSPORT
var passport = require("passport");
var session = require("express-session");
var localStrategy = require("passport-local");
// var Strategy = require('passport-local').Strategy;//from gitHub Tutorial

var mongoose = require("mongoose");

var twilio = require('twilio');

//MODELS
var User = require("./models/user");

//ROUTES
var index = require("./routes/index");
var register = require("./routes/register");
var work = require("./routes/work");
var user = require("./routes/user");
var sms = require("./routes/sms");
var phoneCall = require("./routes/phoneCall");
// var weather = require("./routes/weather");

// var contractors = require("./routes/contractors");

var path = require("path");

var twilio = require("twilio");

var ivr = require("./routes/ivr");

// //brought in from previous experiment
// var Schema = mongoose.Schema;
var Forecast = require('forecast');//not using
var darksky = require('darksky');//not using
var geocoder = require('geocoder');
// var twiml = require('./public/assets/scripts/twiml.js');
var restler = require('restler');
//end of brought in from previous experiment
var Agenda = require('agenda');//#AGENDA




app.use(session({
    secret: "secret",
    key: "user",
    resave: true,
    s: false,
    cookie: {maxAge: 365 * 24 * 60 * 60 * 1000, secure: false}
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));//changed this to false for twilio
app.use(passport.initialize());
app.use(passport.session());

// //MONGO SETUP for Heroku mLab
// var mongoURI =
//   process.env.MONGOLAB_URI ||
//   process.env.MONGOHQ_URL ||
//   'mongodb://localhost/work';
//
// var MongoDB = mongoose.connect(mongoURI).connection;

// var mongoURI = "mongodb://localhost/work";
// var MongoDB = mongoose.connect(mongoURI).connection;

//#AGENDA BELOW
// var agenda = new Agenda({db: {address: 'mongodb://localhost/work'}});

// var mongoConnectionString = "mongodb://localhost/work";
// var agenda = new Agenda({db: {address: mongoURI}});
//
// agenda.define('greet the world', function(job, done) {
//   // console.log( 'I said hello world rightaway!');
//   done();
// });
//
// agenda.define('say hello', function(job, done) {
//   // console.log('I waited 1 mins to say hi Mike!');
//   done();
// });
//
// agenda.on('ready', function() {
//   agenda.schedule('now', 'greet the world');
//   agenda.schedule('in 1 minutes', 'say hello');
//   agenda.start();
// });


// console.log('Wait 10 seconds...');
//#AGENDA ABOVE



// MongoDB.on("error", function(err){
//     console.log("Mongo Connection Error: ", err);
// });
//
// MongoDB.once("open", function(err){
//     console.log("Mongo Connection Open");
// });

//PASSPORT SESSION
passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        if(err) done(err);
        done(null, user);
    });
});

passport.use("local", new localStrategy({
      passReqToCallback : true,
      usernameField: 'username'
    }, function(req, username, password, done){
        User.findOne({username: username}, function(err,user){
            if(err) throw err;
            if(!user){
              return done(null, false, {message: "Incorrect username or password"});
            }

            user.comparePassword(password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                  return done(null, user);
                } else {
                  done( null, false, {message: "Incorrect username or password"});
                }
            });
        });
    }
));



// //START SEEDING DATABASE WITH CONTRACTORS
// // Geocode and save work to database
//       geocoder.geocode("5650 Humboldt Avenue North, Brooklyn Center, MN 55430", function ( err, geocodedData ) {
//         var geocodedData = geocodedData.results[0].geometry.location;
//         var geo = [];
//             geo[0]=geocodedData.lat;
//             geo[1]=geocodedData.lng;
// // saving geocoded address to the database
// mongoose.model("Contractors", new Schema({
//   "fname" : String, "lname" : String, "type" : String, "phone" : String, "email" : String,
// "address" : String, "geo": {
//     type: [Number],
//     index: '2d'
//   }
// }));
// var Contractor = mongoose.model("Contractors");
// var addedContractor = new Contractor({
//   "fname" : "Michelle", "lname" : "Elliott",
//   "type" : "Tutor",  "phone" : "16128121238",
//   "email" : "melliott03@gmail.com",
//   "address" : "5650 Humboldt Avenue North, Brooklyn Center, MN 55430", geo : geo
// });
// addedContractor.save(function(err, data){
//     if(err){
//       console.log(err);
//       console.log('data (new contractor item created inside addContractor.save) ',data);
//     }
// });
// });
// //END SEEDING DATABASE WITH CONTRACTORS
// app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico')));


var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

app.use("/register", register);
app.use("/user", isAuthenticated, user); // START HERE TODAY
app.use("/work", work);
app.use("/sms2", sms);



// app.use("/weather", weather);

// app.use("/contractor", contractor);
app.use("/phoneCall/:id", phoneCall);
// Create a webhook that handles an incoming SMS
app.post('/sms', function(request, response) {
    // Create a TwiML response
    var twiml = new twilio.TwimlResponse();
    twiml.response('Hello from node.js!');

    // Render the TwiML response as XML
    response.type('text/xml');
    response.send(twiml.toString());
});
//

//START https://www.twilio.com/blog/2015/09/monitoring-call-progress-events-with-node-js-and-express.html
// Set Express routes.
app.post('/events', (req, res) => {
  var to = req.body.To;
  var fromNumber = req.body.From;
  var callStatus = req.body.CallStatus;
  var callSid = req.body.CallSid;

console.log(to, fromNumber, callStatus, callSid);
  res.send('Event received');
});
//
app.get('/voice', (req, res) => {
  console.log('req.query : ', req.query.user_id);
  //Find the user in the database
  Work.findById(req.query.work_id, function(err, work){
    console.log('INSIDE /voice on server "work:"', work);
    if(err){
      console.log(err);
    }
    // work.contractor_id = req.user._id; // req.user._id
    // work.status = "Accept";
    // // save the work
    // work.save(function(err) {
    //   if (err)
    //   res.send(err);
    //   console.log('2nd INSIDE accept after save on server work:', work);

      User.findById(req.query.user_id, function(err, contractor){
        console.log('INSIDE accept on server work.contractor_id contractor:', contractor);
        if(err){
          console.log(err);
        }
          deliverUserMessage(work, contractor);
          // res.json({ message: 'work updated with accept!' });
        });

      // res.json({ message: 'work updated with accept!' });
    // });
  });
    var deliverUserMessage = function(work, contractor){
      //Start of original voice call response
      var firstname = contractor.firstname;
      var lastname = contractor.lastname;
      var address = work.address;
      var date = work.datetime;
       date = Date.create(date).format(); //http://sugarjs.com/api/Date/format
      console.log('Date.create(date):' ,Date.create(date));
      // console.log('(8).hoursBefore(reminderDateTime):' ,(2).hoursBefore(reminderDateTime));

      // Generate a TwiML response
      var twiml = new twilio.TwimlResponse();
      // Talk in a robot voice over the phone.
      twiml.say('Hello, ' + firstname + " , " + lastname + 'this is a reminder for your work appointment on'+ date +' Please plan to arrive 10 minutes early. This is Mike Elliot saying, we love you. ');
      // Set the response type as XML.
      res.header('Content-Type', 'text/xml');
      // Send the TwiML as the response.
      res.send(twiml.toString());
      //END of original voice call response
    }
});
//END https://www.twilio.com/blog/2015/09/monitoring-call-progress-events-with-node-js-and-express.html


app.use('/ivr', ivr);

// app.get('/logout', logout());

app.get('/logout', function(req, res){
  console.log('inside /logout on server before LOGOUT', req.user);
  req.logout();
  console.log('inside /logout on server AFTER LOGOUT', req.user);
  console.log('inside /logout on server BEFORE req.session.destroy:', req.session);
  req.session.destroy();
  res.redirect('/');
});

// app.get('/logout', function(req, res){
//   console.log('inside /logout on server before LOGOUT', req.user);
//   req.logout(function(req, res){
//     console.log('inside /logout on server before LOGOUT', req.user);
//     console.log('inside /logout on server AFTER LOGOUT', req.user);
//     // req.session.destroy();
//     res.redirect("/");
//   });
//
// });

//Twilio Video
/*
Generate an Access Token for a chat application user - it generates a random
username for the client requesting a token, and takes a device ID as a query
parameter.
*/
app.get('/boink', function(req, res) {
  console.log('/boink before randomUsername function req.user._id:::', req.user._id);

    // var identity = randomUsername();
    var identity = ""+req.user._id;

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    var token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET
    );

    // Assign the generated identity to the token
    token.identity = identity;

    //grant the access token Twilio Video capabilities
    var grant = new ConversationsGrant();
    grant.configurationProfileSid = process.env.TWILIO_CONFIGURATION_SID;
    token.addGrant(grant);

    // Serialize the token to a JWT string and include it in a JSON response
    res.send({
        identity: identity,
        token: token.toJwt()
    });
});//End Twilio Video




app.use("/", index);


app.set("port", (process.env.PORT || 5100));

app.listen(app.get("port"), function(){
    console.log("Listening on port: ", app.get("port"));
});



// //START agenda module example for Node.js [npmawesome and nodejitsu]
// Agenda = require('agenda');
//
// var agenda = new Agenda({db: {address: 'localhost:27017/work'}});
//
// agenda.define('greet the world', function(job, done) {
//   console.log(job.attrs.data.time, 'hello world!');
//   done();
// });
//
// agenda.schedule('in 10 seconds', 'greet the world', {time: new Date()});
// agenda.start();
//
// console.log('Wait 10 seconds...');
// //END agenda module example for Node.js [npmawesome and nodejitsu]

module.exports = app;
