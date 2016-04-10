var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var WorkSchema = new Schema({
    username: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    lastlogin: {type: Date, default: Date.now }
});

mongoose.model("Works", new Schema({"address" : String, "language" : String,
  "geo": {
    type: [Number],
    index: '2d'
  }
}));
var Work = mongoose.model("Works");


module.exports = mongoose.model(WorkSchema);
