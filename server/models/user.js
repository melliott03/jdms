var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
    username: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true},
    firstname: {type: String, required: false},
    lastname: {type: String, required: false},
    phone: {type: String, required: false},
    address: {type: String, required: false},
    type: {type: String, required: false},
    email: {type: String, required: true},
    dob: {type: String, required: false},
    last4sos: {type: String, required: false},
    epirts: {type: Object, required: false},
    plaidTokens: {type: Object, required: false},
    role: {type: String, required: false},
    privilege_role: {type: String, required: false},
    action: {type: String, required: false},
    company: {type: String, required: false},
    lastlogin: {type: Date, default: Date.now },
    geo: {
        type: [Number],
        index: '2d'
      }
});

UserSchema.pre("save", function(next){
    console.log("Made it into Pre!");
    console.log(" 'this' inside Pre!", this);
    var user = this;

    if(!user.isModified("password")) return next;
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err,salt){
        if(err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err);
            user.password = hash;
            console.log("Did I hash? : " , user.password);
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb){
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model("User", UserSchema);
