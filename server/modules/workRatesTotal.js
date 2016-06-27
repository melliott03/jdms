var moment = require('moment');
var parser = require('parse-address');
var workRates = require('../modules/workRates');

var workRatesTotal = function(work){

  var startDateTime = work.date;
  var endDateTime = work.endDateTime;

  //CALCULATE HOURLY CHARGE
  var workRatesObject = workRates(work);
  console.log('workRatesObject', workRatesObject);
  // CALCULATE DURATION
  var a = moment(endDateTime);
  var b = moment(startDateTime);
  var workDuration  = a.diff(b, 'minutes');
  // console.log('workDuration',workDuration);

  // CALCULATE TOTAL APPOINTMENT COST
  var hourlyCharge = workRatesObject.charge;
  var perMinuteCharge = hourlyCharge/60;
  console.log('perMinuteCharge', perMinuteCharge);
  timeCost = workDuration * perMinuteCharge;
  timeCost += .098687;
  workRatesObject.durationMins = workDuration;
  console.log('timeCost', timeCost);
  workRatesObject.durationCost = Math.round(timeCost, 2);
  console.log('workRatesObject.durationCost', workRatesObject.durationCost);


  //IS THIS SHORT NOTICE ?
  var a = moment(startDateTime);
  var b = moment();
  var hoursUntilAppointment  = a.diff(b, 'minutes');

  // IF YES, CALCULATE SHORT NOTICE FEE IF AN
  if (hoursUntilAppointment < 1440) { //1440 minutes = 24 hours
      workRatesObject.shortNoticeFee = (20 / 100) * workRatesObject.charge; // 20% of charge rate
  }else {
    workRatesObject.shortNoticeFee = 0;
  }

  var finalCost = workRatesObject.durationCost + workRatesObject.shortNoticeFee;
  workRatesObject.finalCost = Math.round(finalCost, 2);

  return workRatesObject;

};

module.exports = workRatesTotal;
