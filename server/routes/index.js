var express = require("express");
var router = express.Router();
var passport = require("passport");
var path = require("path");


router.post("/", passport.authenticate("local", {
    successRedirect: "/assets/views/users.html",
    failureRedirect: "./public/start"
}));

router.get("/*", function(req,res,next){
    console.log(req.params[0]);
    var file = req.params[0] || "/";
    res.sendFile(path.join(__dirname, "../public/assets/views/user.html", file));
});

module.exports = router;
