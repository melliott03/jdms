// Invoke 'strict' JavaScript mode
'use strict';
 var redis = require('redis'),
     zlib = require('zlib'),
     crypto = require('crypto');

module.exports = {
    query: function(mongoose, client, zip){
      mongoose.Query.prototype._exec = mongoose.Query.prototype.exec;
      mongoose.Query.prototype.exec = function(callback) {
         if (!(this._ttl))
          return mongoose.Query.prototype._exec.apply(this, arguments);

        var _self = this;
        var _expires = this._ttl;
        var _collectionName = this.model.collection.name;

       var  model = this.model;
       var _options = this._optionsForExec(model) || {};
       var fields = this._fields || {};
        var _meta = {
            zip: zip,
            host: _self.model.db.host,
            port: _self.model.db.port,
            db: _self.model.db.name,
            collection: _collectionName,
            populate: _self.options.populate || {},
            options: _options,
            query: _self._conditions,
            fields: _self._fields || {},
            path: _self._path,
            distinct: _self._distinct
       };

       var _key = this._key || crypto.createHash('md5').update(JSON.stringify(_meta)).digest('hex');

        client.get(_key, function(err, result){
          if(!result){
            return mongoose.Query.prototype._exec.call(_self, function(err, docs) {
              if (err) {
                return callback(err);
              }
              var _val = JSON.stringify(docs);
              if(zip){
                  _val = zlib.deflate(_val, function(err, buffer){
                    if(err)
                        console.log(err);
                    _val = buffer.toString('base64');
                    client.set(_key, _val);
                    client.expire(_key, _expires);
               });
              }
              return callback(null, docs);


            });
          }
          else {
            //var _val = JSON.parse(result);
              if(zip){
                var _input = new Buffer(result, 'base64');
                zlib.inflate(_input, function(err, buffer){
                  if(err)
                    console.log(err);
                  _val = JSON.parse(buffer.toString());
                  return callback(null, _val);
                });
              }
              else {
                var _val = JSON.parse(result);
                return callback(null, _val);
              }

          }

        });

        return this;
      };
    },
    cache: function(mongoose){
      //  cachegoose
      mongoose.Query.prototype.cache = function(ttl, customKey) {
         if (typeof ttl === 'string') {
           customKey = ttl;
           ttl = 60;
         }

         this._ttl = ttl;
         this._key = customKey;
         return this;
       };

    },
    init: function(mongoose, options){
        console.log('mongoose-redis init create cache prototype.');
        var  host = options.host || "localhost";
        var  port = options.port || 6379;
        var  pwd = options.pass || options.password || options.pwd || "";
        var  redisOptions = options.options || {};
        var zip = options.compress || false;
        var  client = redis.createClient(port, host, redisOptions);

        if (pwd.length > 0) {
            client.auth(pwd, function(err) {
              if (err){
                  throw new Error(err);
              }
            });
          }
        this.cache(mongoose);
        this.query(mongoose, client, zip);

      }

};
