var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var http = require ('http');

var passport = require("passport");
var session = require("express-session");
var localStrategy = require("passport-local");

var mongoose = require("mongoose");

//MODELS
var User = require("./models/user");

//ROUTES
var index = require("./routes/index");
var register = require("./routes/register");
var work = require("./routes/work");
var user = require("./routes/user");

var path = require("path");

//brought in from previous experiment
var Schema = mongoose.Schema;
var Forecast = require('forecast');//not using
var darksky = require('darksky');//not using
var geocoder = require('geocoder');
// var twiml = require('./public/assets/scripts/twiml.js');
var restler = require('restler');
//end of brought in from previous experiment
Agenda = require('agenda');//#AGENDA




app.use(session({
    secret: "secret",
    key: "user",
    resave: true,
    s: false,
    cookie: {maxAge: 60000, secure: false}
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

//MONGO SETUP for Heroku mLab
var mongoURI =
  process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/work';

var MongoDB = mongoose.connect(mongoURI).connection;

// var mongoURI = "mongodb://localhost/work";
// var MongoDB = mongoose.connect(mongoURI).connection;

//#AGENDA BELOW
// var agenda = new Agenda({db: {address: 'mongodb://localhost/work'}});

// var mongoConnectionString = "mongodb://localhost/work";
var agenda = new Agenda({db: {address: mongoURI}});

agenda.define('greet the world', function(job, done) {
  console.log( 'I said hello world rightaway!');
  done();
});

agenda.define('say hello', function(job, done) {
  console.log('I waited 1 mins to say hi Mike!');
  done();
});

agenda.on('ready', function() {
  agenda.schedule('now', 'greet the world');
  agenda.schedule('in 1 minutes', 'say hello');
  agenda.start();
});


console.log('Wait 10 seconds...');
//#AGENDA ABOVE

MongoDB.on("error", function(err){
    console.log("Mongo Connection Error: ", err);
});

MongoDB.once("open", function(err){
    console.log("Mongo Connection Open");
});

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

app.use("/register", register);
app.use("/user", user); // START HERE TODAY
app.use("/work", work);
app.use("/", index);


app.set("port", (process.env.PORT || 5000));

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
