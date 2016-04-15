var mongoURI =
  process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/work';
// var MongoDB = mongoose.connect(mongoURI).connection;

module.exports.mongoURI =  mongoURI;
