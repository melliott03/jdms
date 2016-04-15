var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.model("Works", new Schema({
  "type" : String, "datetime" : String, "endTime" : String,
"address" : String, "details" : String, "customer_id" : String, "status" : String, "contractor_id" : String, "weather" : Array, "geo": {
    type: [Number],
    index: '2d'
  }
}));

var Work = mongoose.model("Works");

module.exports = Work;
