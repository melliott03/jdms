var express = require("express");
var router = express.Router();
var User = require("../models/user");
var sugar = require('sugar');

router.get("/", function(req,res,next){
    res.json(req.isAuthenticated());
});

router.get("/name", function(req,res,next){
    console.log("Hi class! ", req.isAuthenticated());
    var reminderDateTime =  req.user.lastlogin;
        console.log('Date.create(reminderDateTime):' ,Date.create(reminderDateTime));
        console.log('(8).hoursBefore(reminderDateTime):' ,(2).hoursBefore(reminderDateTime));
        reminderDateTime = (2).hoursBefore(reminderDateTime);
    var milliseconds = reminderDateTime.getTime();
        console.log(' (2).hoursBefore(reminderDateTime) in milliseconds:' , milliseconds);

        // reminderDateTime = reminderDateTime.setHours(reminderDateTime.getHours() - 12);
    var resUser = {
        username: req.user.username,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        datecreated: req.user.lastlogin,
        reminderDateTime: reminderDateTime
    };
    res.json(resUser);
});

module.exports = router;
