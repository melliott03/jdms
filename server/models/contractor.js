var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.model("Contractors", new Schema({
  "fname" : String, "lname" : String, "type" : String, "phone" : String, "email" : String,
"address" : String, "geo": {
    type: [Number],
    index: '2d'
  }
}));

var Contractor = mongoose.model("Contractors");

module.exports = Contractor;
