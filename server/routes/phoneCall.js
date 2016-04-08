var express = require("express");
var router = express.Router();
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Forecast = require('forecast');//not using
var darksky = require('darksky');//not using
var geocoder = require('geocoder');
// var twiml = require('./public/assets/scripts/twiml.js');
var restler = require('restler');

var sugar = require('sugar');

router.get("/:id", function (req, res) {
  console.log('req.params.id inside /phoneCall/:id');
  console.log('req.params.id inside /phoneCall/:id', req.params.id);

  var builder = require('xmlbuilder');
  var xml = builder.create('Response')
  .ele('Say')
  .ele('Say', {'voice': 'Alice'}, 'This is a message from the Michael application. Goodbye.')
  .end({ pretty: true});
  console.log(xml);
res.send({xml});
});
// 
// <?xml version="1.0"?>
// <root>
//   <xmlbuilder>
//     encoding
//     <repo type="git">git://github.com/oozcitak/xmlbuilder-js.git</repo>
//   </xmlbuilder>
// </root>
//
//
// <?xml version="1.0" encoding="UTF-8"?>
//  <Response>
//  <Say voice="alice">To get connected to your interpreting sesson, enter your 4 digit key</Say>
//  <Play>http://demo.twilio.com/docs/classic.mp3</Play>
//  </Response>



module.exports = router;
