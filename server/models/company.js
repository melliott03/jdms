var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.model("Companies", new Schema({
  "date_created" : String, "type" : String, "name" : String
}));


var Company = mongoose.model("Companies");

module.exports = Company;
