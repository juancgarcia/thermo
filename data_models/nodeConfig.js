/*
    Usage:
    var nodeConfig = require('./datamodel/nodeConfig')(mongoose);

    This model defines configuration updates to be sent back to each nodes after they transmit
*/

// var metaBase = require('../public/js/datamodel/nodeConfig');
module.exports = function(mongoose){
    var nodeConfig = {};
    
    nodeConfig.schema = new mongoose.Schema({
        name: String, // friendly name of this configuration group
        deviceType: String,
        deviceId: Number,
        refreshSeconds: Number,
        unit: String // 'celius'|'farenheit'|'auto' ('auto' .: do not change)
    });
    
    nodeConfig.schema.methods.print = function (next) {
        var instance = this;
        console.log(instance);
        if(next) next();
    };
    
    nodeConfig.model = mongoose.model('NodeConfig', nodeConfig.schema, 'nodeConfig');
    
    return nodeConfig;
}