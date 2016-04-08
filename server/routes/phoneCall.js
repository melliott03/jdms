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
  var builder = require('xmlbuilder');
  var xml = builder.create('root')
  .ele('xmlbuilder')
  .ele('repo', {'type': 'git'}, 'git://github.com/oozcitak/xmlbuilder-js.git')
  .end({ pretty: true});
  console.log(xml);

console.log('req.params.id inside /phoneCall/:id');

console.log('req.params.id inside /phoneCall/:id', req.params.id);
res.send({"params" : ''+req.params.id});
});



module.exports = router;
