var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.model("Works", new Schema({
  "date_created" : String, "type" : String, "datetime" : String, "endTime" : String,
"address" : String, "details" : String, "customer_id" : String, "status" : String, "contractor_id" : String, "money" : Object, "weather" : Array, "geo": {
    type: [Number],
    index: '2d'
  }
}));

var Work = mongoose.model("Works");

module.exports = Work;
