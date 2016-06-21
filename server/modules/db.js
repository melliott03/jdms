// var path = require("path");
var mongoose = require("mongoose");

// var mongoURI = require("../modules/mongoURI");

var mongoURI =
  process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/work';
var MongoDB = mongoose.connect(mongoURI).connection;

MongoDB.on("error", function(err){
    console.log("Mongo Connection Error: ", err);
});

MongoDB.on("open", function(){
    console.log("Mongo Connection Open");
});





// module.exports.mongoURI =  mongoURI;
module.exports.MongoDB = MongoDB;
