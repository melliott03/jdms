var express = require("express");
var router = express.Router();
var passport = require("passport");
var path = require("path");


// var contractorOrCustomer = function(){
//   console.log('USER.ROLE:', user);
//   if (user.role == 'contractor'){
//     return  "/assets/views/contractors.html";
//   }else if (user.role == 'customer') {
//     return  "/assets/views/customers.html";
//   }
// }
//write post here
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
