var moment = require('moment');
var parser = require('parse-address');

var workRates = function(workItem){
  var parsedAddressObject = parser.parseLocation(workItem.address);

  console.log('workItem::', workItem);
  console.log('workItem.date::', workItem.date);

 // TODO: search DB for pricing object with states as keys. replace hardcoded prices with those stored in DB
//PRICING ALGORYMTHEM FOR MN
if (parsedAddressObject.state == 'MN') {
  // var hour = workItem.date.getHours();
  var hour = moment(workItem.date).hour();
  console.log('hour::',hour);

  //SOCIAL SERVICE
  if (workItem.type == "Social Service") {
    // var hour = new Date().getHours();
    switch (true) {
        case (hour < 5):
            // alert("before than five AM");
            return {charge: 120}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 9):
            // alert("between 5 and 8 AM");
            return {charge: 60}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 18):
            // alert("between 9 and 5 PM");
            return {charge: 60}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 20):
            // alert("between 6 PM and 8 PM");
            return {charge: 80}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 23):
            // alert("between 9 PM and 11 PM");
            return {charge: 120}; //set charge and pay from input from DOM stored in DB
            break;
        default:
            // alert("none");
            break;
    }
  }

  //MEDICAL
  else if (workItem.type == "Medical") {
    // var hour = new Date().getHours();
    switch (true) {
        case (hour < 5):
            // alert("before than five AM");
            return {charge: 120}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 9):
            // alert("between 5 and 8 AM");
            return {charge: 70}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 18):
            // alert("between 9 and 5 PM");
            return {charge: 60}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 20):
            // alert("between 6 PM and 8 PM");
            return {charge: 85}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 23):
            // alert("between 9 PM and 11 PM");
            return {charge: 120}; //set charge and pay from input from DOM stored in DB
            break;
        default:
            // alert("none");
            break;
    }
  }

  //LEGAL
  else if (workItem.type == "Legal") {
    // var hour = new Date().getHours();
    switch (true) {
        case (hour < 5):
            // alert("before than five AM");
            return {charge: 170}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 9):
            // alert("between 5 and 8 AM");
            return {charge: 120}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 18):
            // alert("between 9 and 5 PM");
            return {charge: 100}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 20):
            // alert("between 6 PM and 8 PM");
            return {charge: 120}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 23):
            // alert("between 9 PM and 11 PM");
            return {charge: 170}; //set charge and pay from input from DOM stored in DB
            break;
        default:
            // alert("none");
            break;
    }
  }

  //SOCIAL SERVICE
  else {
    // var hour = new Date().getHours();
    switch (true) {
        case (hour < 5):
            // alert("before than five AM");
            return {charge: 110}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 9):
            // alert("between 5 and 8 AM");
            return {charge: 75}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 18):
            // alert("between 9 and 5 PM");
            return {charge: 50}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 20):
            // alert("between 6 PM and 8 PM");
            return {charge: 75}; //set charge and pay from input from DOM stored in DB
            break;
        case (hour < 23):
            // alert("between 9 PM and 11 PM");
            return {charge: 110}; //set charge and pay from input from DOM stored in DB
            break;
        default:
            // alert("none");
            break;
    }
  }

}//end if statement priching algorymthem for MN


};

module.exports = workRates;
