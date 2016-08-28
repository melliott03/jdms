var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.model("Works_Tel", new Schema({
  "workerSid" : String, "inboundCallSid" : String, "inboundCallSidSecond" : String, "inboundSummary" : Object, "outboundSummary" : Object, "customer_id" : String, "contractor_id" : String, "money" : Object, "shortid" : String
}));

var Work_Tel = mongoose.model("Works_Tel");

module.exports = Work_Tel;
