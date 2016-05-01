//used for token auth http://slatepeak.com/guides/building-a-software-as-a-service-saas-startup-pt-2/
//http://passwordsgenerator.net/
module.exports = {
'secret': 'sP4Z33N#JxG&F+czXcqnyN6t2YVhZ__aHDAYyMTySaMZMLsUX*P?vVmgmngHJ%!rNgNL!EgGTdLSCUKFdPB&?_UVjPp2VuC6ZruTkQZXnvzv$V2Ns+KySeEckPNr+hZd',
'database': process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/work'
};
