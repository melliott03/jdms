// var express = require("express");
// var router = express.Router();
// var path = require("path");
// var bodyParser = require("body-parser");
// var sugar = require('sugar');
//
// router.post("/", function(req,res){
//   // var reminderDateTime =  req.user.lastlogin;
//   //     console.log('reminderDateTime:' ,reminderDateTime);
//   //     console.log('Date.create(reminderDateTime):' ,Date.create(reminderDateTime));
//   //     console.log('(8).hoursBefore(reminderDateTime):' ,(2).hoursBefore(reminderDateTime));
//   //     reminderDateTime = (2).hoursBefore(reminderDateTime);
//   // var milliseconds = reminderDateTime.getTime();
//   //     console.log(' (2).hoursBefore(reminderDateTime) in milliseconds:' , milliseconds);
//   // console.log('INSIDE weather route on server:',req.body)
//   //WEATHER (ALERTS) use a UNIX GMT timestamp converter for angular to make datetime human readable
//     var work = req.body;
//     // console.log(work);
//     var workArray=[];
//     var data="";
//     for (var i = 0; i < work.length; i++) {
//         var singleWork = work[i];
//         var lat = singleWork.geo[0],
//             lon = singleWork.geo[1],
//             time = singleWork.datetime;
//
//             var reminderDateTime =  time;
//                 console.log('reminderDateTime:' ,reminderDateTime);
//                 console.log('Date.create(reminderDateTime):' ,Date.create(reminderDateTime));
//                 console.log('(8).hoursBefore(reminderDateTime):' ,(2).hoursBefore(reminderDateTime));
//                 reminderDateTime = (2).hoursBefore(reminderDateTime);
//                 time = reminderDateTime.getTime();
//                 time = ""+time;
//                 time = time.slice(0, - 3);
//                 console.log(' (2).hoursBefore(reminderDateTime) in milliseconds:' , time);
//
//             // console.log('TIME.getTime before http call',time);
//
//               data += ""+lat+","+lon+","+time; //"34.6036,98.3959"
//
//           } //end of forloop
//           console.log('data before http call',data);
//
//           // console.log('data before http call',data);
//           // const https = require('https');
//           // https.get("https://api.forecast.io/forecast/a7477969f3764bd6cd2bf01efa7a7365/" + data, (res) => {
//           //   // console.log('statusCode: ', res.statusCode);
//           //   // console.log('headers: ', res.headers);
//           //   var weather = res;
//           //   work.weather = weather;
//           //   workArray.push(work)
//           //   res.on('data', (d) => {
//           //     process.stdout.write(d);
//           //     console.log('MIKE IS GREAT after date: ',i);
//           //   });
//           // }).on('error', (e) => {
//           //   console.error(e);
//           // }); // END WEATHER
//
//
// });
//
// module.exports = router;
