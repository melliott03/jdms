// var express = require("express");
// var router = express.Router();
// var path = require("path");
// var Animal = require("../models/animal");
//
// router.route("/animal")
//     .get(function(req,res){
//         Animal.find(function(err, animals){
//             if(err){
//               console.log(err);
//             }
//
//             res.send(animals);
//         });
//     })
//     .post(function(req,res){
//         var animal = new Animal({
//             name : req.body.name,
//             age : req.body.age,
//             type : req.body.type,
//             details : req.body.details,
//             imageurl : req.body.imageurl,
//         });
//
//         animal.save(function(err, animal){
//             if(err){
//               console.log(err);
//             }
//
//             res.send(animal);
//         });
//     });
//
// router.route("/animal/:id")
//     .delete(function(req,res){
//         console.log("HERE: ",  req.params);
//         Animal.findByIdAndRemove(req.params.id, function(err, animal){
//             if(err){
//               console.log(err);
//             }
//
//             res.send(animal);
//         });
//     });
//
// router.get("/*", function(req,res){
//     var file = req.params[0] || "/assets/views/index.html";
//     res.sendFile(path.join(__dirname, "../public/", file));
// });
//
// module.exports = router;
