var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.model("Works", new Schema({
  "date_created" : String, "type" : String, "datetime" : String, "endTime" : String, "work_signatures" : Object, "notifications" : Array,
"address" : String, "company" : Object, "details" : Object, "customer_id" : String, "status" : String, "contractor_id" : String, "money" : Object, "shortid" : String, "weather" : Array, "geo": {
    type: [Number],
    index: '2d'
  }
}));


var Work = mongoose.model("Works");

module.exports = Work;
