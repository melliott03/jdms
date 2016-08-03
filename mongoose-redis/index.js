// Invoke 'strict' JavaScript mode
'use strict';
module.exports = function(mongoose, options){
    require('./src/cache').init(mongoose, options || {});
};
