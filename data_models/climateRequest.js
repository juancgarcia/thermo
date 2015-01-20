/*
    Usage:
    var climateRequest = require('./datamodel/climateRequest')(mongoose);
*/

// var metaBase = require('../public/js/datamodel/climateRequest');
module.exports = function(mongoose){
    var climateRequest = {};
    
    climateRequest.schema = new mongoose.Schema({
        // Basic
        location: String, // null(average of zones)|a_zone_name
        type: String, // temperature|...?
        value: Number,
        unit: String, // 'celius'|'farenheit'|...?
        timestamp: Number
    });
    
    climateRequest.schema.methods.print = function (next) {
        var instance = this;
        console.log(instance);
        if(next) next();
    };
    
    climateRequest.model = mongoose.model('ClimateRequest', climateRequest.schema, 'climateRequest');
    
    return climateRequest;
}