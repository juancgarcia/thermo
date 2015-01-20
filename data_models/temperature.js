/*
    Usage:
    var temperature = require('./datamodel/temperature')(mongoose);
*/

// var metaBase = require('../public/js/datamodel/temperature');
module.exports = function(mongoose){
    var temperature = {};
    
    temperature.schema = new mongoose.Schema({
        // Basic
        deviceType: String,
        deviceId: String,
        value: Number,
        unit: String, // 'celius'|'farenheit'
        timestamp: Number
    });
    
    temperature.schema.methods.print = function (next) {
        var instance = this;
        console.log(instance);
        if(next) next();
    };
    
    temperature.model = mongoose.model('Temperature', temperature.schema, 'temperature');
    
    return temperature;
}