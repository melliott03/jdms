require('dotenv').load();//Twilio Video
var express = require("express");

var app = express();
var db = require("./modules/db");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var morgan = require('morgan');//brought in here for passport JWT but might be a dependency for others
var http = require('http').Server(app);  // .createServer(app)
var io = require('socket.io').listen(http);
var socketioJwt = require('socketio-jwt');

var path = require('path');//Twilio Video
var AccessToken = require('twilio').AccessToken;//Twilio Video
var ConversationsGrant = AccessToken.ConversationsGrant;//Twilio Video
var User = require('./models/user');
var configsty = require('config-node')({
  dir: 'configsty', // where to look for files
  ext: null, // spoil the fun, tell me which one it is ('' for directory). Improves performance.
  env: process.env.NODE_ENV || 'development' // set which one instead of smart defaults
});
console.log('configsty.APP_URL::', configsty.APP_URL);
var stripe = require("stripe")(configsty.STRIPE_TEST);

app.use(function(req, res, next){ //https://onedesigncompany.com/news/express-generator-and-socket-io
  res.io = io;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));//Twilio Video

var mongoose = require("mongoose");

// set Promise provider to bluebird
mongoose.Promise = require('bluebird');

var nev = require('email-verification')(mongoose); //this might need to be placed after the user model

var passport = require('passport');
require('./config/passport')(passport);
var jwt = require('jsonwebtoken');
// Initialize passport for use
// Create API group routes
var apiRoutes = express.Router();

var twilio = require('twilio');

//ROUTES
var index = require("./routes/index");


  var fs = require('fs');
  // Requires controller  https://github.com/danialfarid/ng-file-upload/wiki/Node-example
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));//changed this to false for twilio
  app.use(passport.initialize());

  app.use(morgan('dev'));


  apiRoutes.post('/authenticate', function(req, res) {
    console.log('req.body in apiRoutes.post /authenticate::', req.body);
    User.findOne({
      email: req.body.email
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.send({ success: false, message: 'Authentication failed. User not found.' });
      } else {
        // Check if password matches
        user.comparePassword(req.body.password, function(err, isMatch) {
          if (isMatch && !err) {
            // Create token if the password matched and no error was thrown
            console.log('user::', user);
            var token = jwt.sign(user, config.secret, {
              expiresIn: 60 * 60 * 24 * 365 // in seconds
            });
            res.json({ user: user, success: true, token: 'JWT ' + token });
          } else {
            res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
          }
        });
      }
    });
  });

  io.on('connection', function(socket){
    console.log('A User socket connection, socket.id!::', socket.id);

    http.getConnections(function(error, count){
      console.log('number of concurrent connections (TCP and or UDP) = :: '+ count);
      if (error) {
        console.log('http.getConnections error::', error);
      }
    });
    console.log('number of connected sockets, 1::', io.engine.clientsCount);
    console.log('number of connected sockets, 3::', Object.keys(io.sockets.sockets).length);
    console.log('number of connected sockets, 4::', Object.keys(io.sockets.connected).length);

    socket.to("/#" +socket.id).emit('connectedSocketID', {"socketid" : socket.id}); //"/#" +

    io.emit('connectedSocketID', {"socketid" : socket.id})
    //Find the User and store their socketid on their user Object
    socket.on('disconnect', function(){
      console.log("A User socket connection has disconnected");
      console.log('number of connected sockets, 1::', io.engine.clientsCount);
      http.getConnections(function(error, count){
        console.log('number of concurrent connections (TCP and or UDP) = :: '+ count);
        if (error) {
          console.log('http.getConnections error::', error);
        }
      });

    console.log('just before User.find socketID:  "$in" : [socket.id], socket.id::', socket.id);
    User.find({ socketID: { "$in" : [socket.id]} }, function(err, user) {
      if (err) throw err;
      // we have the updated user returned to us
      console.log('after find socketID: socket.id, user ::', user);
    });

    User.update(
      { socketID: socket.id },
      { $pull: { 'socketID': socket.id } }, function(err, user) {
        if (err) throw err;

        // we have the updated user returned to us
        console.log('after $pull: socketID: socket.id, user ::',user);
    });

    });

});

/* GET users listing. */
app.post('/testExpressSocket', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  console.log('testExpressSocket on server');
  console.log('testExpressSocket on server req::', req);
  console.log('testExpressSocket on server req.user::', req.user);

  // res.io.emit("socketToMe", "users");
  res.send('respond with a resource.');
});

app.post('/updateUserSocketId', passport.authenticate('jwt', { session: false }), function(req, res) {
  console.log('inside updateUserSocketId req.user:', req.user);
  console.log('inside updateUserSocketId req.user._id:', req.user._id);
  console.log('inside updateUserSocketId req.user.socketID:', req.user.socketID);
  console.log('inside updateUserSocketId req.user._id:', req.body);
  var socketID = req.body.socketid;
  User.update({ _id: req.user._id }, { $addToSet: { socketID: socketID }}, function(err, user) {
    if (err) throw err;
    console.log('after add new socketID to user 1', user);
    User.findOne({ _id: req.user._id }, function(err, user) {
      if (err) throw err;

      var socketsids = user.socketID;
      console.log('after add new socketID to user 2', user);
      console.log('after add new socketID to user, user.socketID 2', user.socketID);

      socketsids.forEach(function(socketid){
        if(io.sockets.sockets[socketid]!=undefined){
          //do nothing
        }else{
          console.log("Socket not connected");
          //remove from user
          var index = socketsids.indexOf(socketid);    // <-- Not supported in <IE9
          if (index !== -1) {
            socketsids.splice(index, 1);
          }
        }
      });
      console.log('socketsids before updating array with new list, socketsids::', socketsids);
      User.findOneAndUpdate({ _id: req.user._id }, { socketID: socketsids }, function(err, user) {
        if (err) throw err;
        // we have the updated user returned to us
        console.log('after updatng user new socketID array, user 3', user);
        console.log('after updatng user new socketID array, user.socketID 3', user.socketID);
        res.send({'userSocketIDsaved' : true});
      });

    });
  });

});

app.post('/updateUserSocketIdmobile', passport.authenticate('jwt', { session: false }), function(req, res) {
  console.log('insode updateUserSocketId req.user._id:', req.user._id);
  console.log('inside updateUserSocketId req.body:', req.body);
  var socketID = req.body;
  console.log('inside updateUserSocketId socketID:', socketID);
  socketID = socketID.socketidit;
  socketID = socketID.split(/[""]/); //substring(socketID.lastIndexOf('"')+1,socketID.lastIndexOf('"'));
  var socketIDstore = socketID[1];
  console.log('inside updateUserSocketId  socketIDstore after parsing:', socketIDstore);

  User.findOneAndUpdate({ _id: req.user._id }, { socketID: socketIDstore }, function(err, user) {
    if (err) throw err;

    // we have the updated user returned to us
    console.log('after saving user oooo',user);
  });
});
//START https://stackoverflow.com/questions/40199580/how-can-i-use-a-letsencrypt-ssl-cert-in-my-heroku-node-express-app
// Read the Certbot response from an environment variable; we'll set this later:
const letsEncryptReponse = process.env.CERTBOT_RESPONSE;
// Return the Let's Encrypt certbot response:
app.get('/.well-known/acme-challenge/:content', function(req, res) {
  res.send(letsEncryptReponse);
});
//END https://stackoverflow.com/questions/40199580/how-can-i-use-a-letsencrypt-ssl-cert-in-my-heroku-node-express-app

app.get('/detail/:id', function(req, res) {
  var _id = req.params.id;
  User.findOne({ _id: _id })
  .cache(120, _id) // custom cache key by id
  .exec(function(err, doc) {
    console.log('doc::', doc);
    res.send(doc);
  });
});

// Protect dashboard route with JWT
app.get('/dashboard', passport.authenticate('jwt', { session: false }), function(req, res) {
  Work.find(function (err, work) {
    if (err) {
      res.send(err, null);
    }

    console.log("FOUND ALL WORKS CONTRACTOR ACCEPTED", work);

    res.json(work);
  }).where('customer_id').equals(''+req.user._id);
});
// Set url for API group routes
app.use('/api', apiRoutes);
// app.use('/epirts', passport.authenticate('jwt', { session: false }), account);

// Protect chat routes with JWT
// GET messages for authenticated user
app.get('/chat', passport.authenticate('jwt', { session: false }), function(req, res) {
  console.log('req.user._id:', req.user);
  Work.find({$or : [{'customer_id': req.user._id}, {'contractor_id': req.user._id}]}, function(err, messages) {
    if (err)
    res.send(err);

    res.json(messages);
  });
});

app.post('/stripecc', passport.authenticate('jwt', { session: false }), function(req, res) {//get rid of this, it is now in /updateCustomer and needs to be in /updateUser
  console.log('req.user:', req.user);
  // console.log('req.body:', req.body);
  console.log('req.body:', req.body);
  console.log('source: req.body.id::', req.body.token);
  var Connected_stripe_ID = req.user.epirts.id;

  var stripe = require("stripe")(
    req.user.epirts.keys.secret
  );

  stripe.accounts.createExternalAccount(
    Connected_stripe_ID,
    {external_account: req.body.token},
    function(err, bank_account) {
      // asynchronously called
      console.log('bank_account::', bank_account);
    }
  ).then(function (response) {
    console.log(' stripe plaidPublic_token response:::: ', response);
    // console.log('token created for card ending in ', response.card.last4);
    User.findOneAndUpdate({ _id: req.user._id }, { epirts: {id: req.user.epirts.id, keys: req.user.epirts.keys, response: req.user.epirts.response, account: req.user.epirts.account} }, function(err, user) {
      if (err) throw err;
      // we have the updated user returned to us
      console.log('after saving user"s stripe info 3233',user);
    });
  });

  res.json({message: "hi from server"});

});





  // app.use("/register", register);
  // app.use("/invite", invite);
  // app.use("/user", passport.authenticate('jwt', { session: false }), user); // START HERE TODAY
  // app.use("/work", passport.authenticate('jwt', { session: false }), work);
  //

// app.use('/updateUser', passport.authenticate('jwt', { session: false }), updateUser );

app.get('/logout', function(req, res){
  console.log('inside /logout on server before LOGOUT', req.user);
  req.logout();
  console.log('inside /logout on server AFTER LOGOUT', req.user);
  console.log('inside /logout on server BEFORE req.session.destroy:', req.session);
  req.session.destroy();
  res.redirect('/');
});

app.post('/api', passport.authenticate('jwt', { session: false }), function(req, res){
  console.log('INSIDE API ON NODE SERVER REQ.BODY=:', req.body);
  res.json({ message: 'You hit the api route on the server...good job!' });
});

app.get('/boink', passport.authenticate('jwt', { session: false }), function(req, res){
  console.log('/boink before randomUsername function req.user._id:::', req.user._id);

  // var identity = randomUsername();
  var identity = ""+req.user._id;

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  var token = new AccessToken(
    configsty.TWILIO_ACCOUNT_SID,
    configsty.TWILIO_API_KEY,
    configsty.TWILIO_API_SECRET
  );

  // Assign the generated identity to the token
  token.identity = identity;

  //grant the access token Twilio Video capabilities
  var grant = new ConversationsGrant();
  grant.configurationProfileSid = configsty.TWILIO_CONFIGURATION_SID;
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response
  res.send({
    identity: identity,
    token: token.toJwt()
  });
});//End Twilio Video

app.use("/", passport.authenticate('jwt', { session: false }), index);
app.set("port", (process.env.PORT || 5100));

http.listen(app.get("port"), function(){
  console.log("Listening on port: ", app.get("port"));
});

module.exports = {app: app, server: http};
