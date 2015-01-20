var mongoose = require('mongoose');

module.exports = function (api, next) {

    api.mongo = {};
    api.mongo.connection = mongoose.connection;
    api.mongo.models = require('./data_models')(mongoose);
    
    // if (api.config.mongo.enable === true) {
      
        api.log("Enabling mongoDB connection", "debug");
        // var connection_string = "mongodb://"+process.env[api.config.mongo.envCredsKey]+"@"+api.config.mongo.host+":"+api.config.mongo.port+"/"+api.config.mongo.dbname;
        var connection_string = "mongodb://"+process.env['mongoCreds'];
        api.log("Mongo Conn Str: "+connection_string);
        
        mongoose.connection.close();
        // mongoose.connection.removeListener('connected');
        // mongoose.connection.removeListener('disconnecting');
        mongoose.connect(connection_string/*, api.config.mongo*/);
        mongoose.connection.on('connected', function(){
          api.log("Mongo successfully connected!");
          api.log("Mongo Conn readyState: "+mongoose.connection.readyState);
        });
        mongoose.connection.on('disconnecting', function(){
          api.log("Mongo shutting down connection!");
          api.log("Mongo Conn readyState: "+mongoose.connection.readyState);
        });
        
        api.mongo._teardown = function (api, next) {
          api.log("Releasing mongoDB connection", "debug");
          mongoose.connection.close();
          next();
        }
        if(next) next();
    // } else {
    //     api.log("Running without MongoDB", "notice");
    //     next();
    // }
};