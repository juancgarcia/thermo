/*
    var models = require('./datamodel')(mongoose);
*/

module.exports = function(mongoose){    
    return {
        'temperature': require('./temperature')(mongoose),
        'nodeConfig': require('./nodeConfig')(mongoose),
        'climateRequest': require('./climateRequest')(mongoose)
    };
};