var moment = require('moment');
var parser = require('parse-address');
var workPay = require('../modules/workPay');

var workPayTotal = function(work){

  var startDateTime = work.date;
  var endDateTime = work.endDateTime;

  //CALCULATE HOURLY CHARGE
  var workPayObject = workPay(work);
  console.log('workPayObject', workPayObject);

  // CALCULATE DURATION
  var a = moment(endDateTime);
  var b = moment(startDateTime);
  var workDuration  = a.diff(b, 'minutes');
  // console.log('workDuration',workDuration);

  // CALCULATE TOTAL APPOINTMENT COST
  var hourlyCharge = workPayObject.charge;
  var perMinuteCharge = hourlyCharge/60;
  console.log('perMinuteCharge', perMinuteCharge);
  timeCost = workDuration * perMinuteCharge;
  timeCost += .098687;
  workPayObject.durationMins = workDuration;
  console.log('timeCost', timeCost);
  workPayObject.durationCost = Math.round(timeCost, 2);
  console.log('workPayObject.durationCost', workPayObject.durationCost);


  //IS THIS SHORT NOTICE ?
  var a = moment(startDateTime);
  var b = moment();
  var hoursUntilAppointment  = a.diff(b, 'minutes');

  // IF YES, CALCULATE SHORT NOTICE FEE IF AN
  if (hoursUntilAppointment < 1440) { //1440 minutes = 24 hours
      workPayObject.shortNoticeFee = (20 / 100) * workPayObject.charge; // 20% of charge rate
  }else {
    workPayObject.shortNoticeFee = 0;
  }

  var finalCost = workPayObject.durationCost + workPayObject.shortNoticeFee;
  workPayObject.finalCost = Math.round(finalCost, 2);

  return workPayObject;

};

module.exports = workPayTotal;
