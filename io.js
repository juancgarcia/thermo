// socket.io 
module.exports = function(api, next){

    /* Server part*/
    // 
    // change thermostat setting
    // report temperature
    // 
    // 
    // 
    // 
    // 

    /* Client side*/
    // 
    // display main temperature setting
    // display fan status
    // display compressor status
    // 
    // list zones and last temperatures
    // 
    // 
    // 
    // 
    // 
    // 

    var io = require('socket.io')(api.server);
    api.io = io;
    models = api.mongo.models;

    /* send lates node reports */

    var getLatest = function(next){
        var
        err = null,
        pattern = 'node:',
        dummy_nodes = [
            {name: 'foo', temp: 22},
            {name: 'bar', temp: 19}
        ];
        // models.temperature.model.distinct('name', { timestamp: {'$max': true}}, function(err, values){
        // models.temperature.model.distinct('name', {}, function(err, values){
        // models.temperature.model.find({}, function(err, values){
        // models.temperature.model.aggregate({'$group':{_id:'$name', timestamp:{$max:"$timestamp"}, 'temp':{'$first':'$temp'}, 'unit':{'$first': '$unit'}}}, function(err, values){
        models.temperature.model.aggregate({
            '$group':{
                _id:'$deviceId',
                timestamp:{$max:"$timestamp"},
                'value':{'$first':'$value'},
                'unit':{'$first': '$unit'}
            }
        }, function(err, values){
            // api.log('latest temperature values');
            // api.log(JSON.stringify(arguments, null, 4));
            next(err, values);
        });
        // db.temperature.aggregate({$group:{_id:'$name', timestamp:{$max:"$timestamp"}, 'temp':{'$first':'$temp'}, 'unit':{'$first': '$unit'}}}).result
        
        // next(err, dummy_nodes);
    };
    var getNodes = function(next){
        models.nodeConfig.model.find(function(err, values){
            next(err, values);
        });

    };
    var getTemperatureAverage = function(next){
        models.temperature.model.aggregate()
            // .sort({"$timestamp": 1})
            .group({
                "_id" : "$deviceId" ,
                "timestamp" : { "$last" : "$timestamp"} ,
                "value" : { "$last" : "$value"} ,
                "unit" : { "$last" : "$unit"}
            })
            .exec(function(err, values){
                // api.log("node values",values);
                if(err)
                    return next(err, null);
                var avgtemp = values.map(function(obj,index,array){ return obj.value; })
                    .reduce(function(prev, curr, index, arr){ return prev += curr;}, 0);
                avgtemp = avgtemp/values.length;
                // api.log("avgtemp", avgtemp);
                // api.log("requestTemperature", requestTemperature)
                next(err, {value: avgtemp, unit: values[0].unit});
            });
    };
    var getClimateRequest = function(next){

        models.climateRequest.model.find()
            .sort({'timestamp': -1})
            .limit(1)
            .exec(function(err, values) {
                 // `posts` will be of length 20
                 var value = (values && values.length > 0)? values[0] : null;
                 err = err || value == null;
                 next(err, value)
            });

    };
    var getList = function(next){

        models.temperature.model.find()
            .sort({'timestamp': -1})
            .limit(20)
            .exec(function(err, values) {
                 // `posts` will be of length 20
                 next(err, values)
            });
    };

    io.on('connection', function(socket){

        console.log('a user connected');
        socket.emit('message', {'message': 'hello world'});
        
        //send data to client
        setInterval(function(){
            socket.emit('date', {'date': new Date()});
            //
            getTemperatureAverage(function(err, temperature){
                return socket.emit('climate.temperatureAvg', {
                    'temperature': temperature || null,
                    'err': err || false
                })
            });
            getClimateRequest(function(err, temperature){
                // if(err) console.log('getClimateRequest: error '+ err);
                // console.log('getClimateRequest: ', err, temperature);
                return socket.emit('climate.temperatureRequest', {
                    'temperature': temperature || null,
                    'err': err || false
                });
            });
        }, 1000);

        var periodic = function(){
            // check temperature
            getClimateRequest(function(err, requestTemperature){
                if(err || !requestTemperature){
                    socket.emit('thermo.fan', {"status": false});
                    socket.emit('thermo.compressor', {"status": false});
                    socket.emit('thermo.notice', {"message": "no requestTemperature"});
                }
                getTemperatureAverage(function(err, temp){
                    if(err || !temp){
                        socket.emit('thermo.fan', {"status": false});
                        socket.emit('thermo.compressor', {"status": false});
                        socket.emit('thermo.notice', {"message": "no zone temperatures"});
                        return;
                    }
                    // if climate request is cool and temperature <= climate request temp
                    if(temp.value > requestTemperature.value){
                        // fan + compressor => on
                        socket.emit('thermo.fan', {'status': true});
                        socket.emit('thermo.compressor', {'status': true});
                    }else{
                        socket.emit('thermo.fan', {"status": false});
                        socket.emit('thermo.compressor', {"status": false});
                    }
                });
            });
        };
        periodic();
        // every 5 mins
        setInterval(periodic, 300000)

        var infrequent = function(){
            getNodes(function(err, nodes){
                if(err) console.log('getNodes: error '+ err);
                return socket.emit('nodes.config', {
                    'nodes': nodes || [],
                    'err': err || false
                });
            });

            getList(function(err, nodes){
                if(err) console.log('getList: error '+ err);
                return socket.emit('nodes.latest', {
                    'nodes': nodes || [],
                    'err': err || false
                });
            });
            // getLatest(function(err, nodes){
            //     if(err) console.log('getLatest: error '+ err);
            //     return socket.emit('nodes.last', {
            //         'nodes': nodes || [],
            //         'err': err || false
            //     })
            // });
        };
        // call once...
        infrequent();
        // ...then every 30 mins 
        setInterval(infrequent, 1800000);
      
        socket.on('climate.temperature', function(data){
            console.log('Temperature change request', data);

            var temp_change = 0;

            if(data && data.value)
                temp_change = data.value;
            else
                return;


            //
            models.climateRequest.model.find()
                .sort({'timestamp': -1})
                .limit(1)
                .exec(function(err, values) {
                    // `posts` will be of length 20
                    var
                    latest = (values && values.length > 0)? values[0] : {
                        location: null,
                        type: 'temperature',
                        value: 75,
                        unit: 'fahrenheit'
                    },
                    climate = new models.climateRequest.model(latest);
                    climate._id = null;
                    climate.isNew = true;
                    climate.value += data.value;
                    climate.timestamp = new Date().getTime();

                    climate.save(function(err, entry, numberAffected){
                        api.log('Save Attempted');
                        if(err){
                            api.log('Save failed', err);
                            return;
                        }
                        api.log('Saved successfully: ', entry);
                    });
                });
            //

        });
      
        socket.on('disconnect', function(){
            console.log('disconnected');
        });
    });

    api.io = io;

    if(next) next();
};