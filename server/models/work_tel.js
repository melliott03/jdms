var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.model("Works_Tel", new Schema({
   "amount" : String, "taskSid" : String, "workerSid" : String, "inboundCallSid" : String, "inboundCallSidSecond" : String, "inboundSummary" : Object, "outboundSummary" : Object, "customer_id" : String, "contractor_id" : String, "moneySummary" : Object, "shortid" : String,
   "language" : String, "money" : Object, "bookingid" : String
}));

var Work_Tel = mongoose.model("Works_Tel");

module.exports = Work_Tel;
