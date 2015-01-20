var
thermo = {
    log: console.log
},
includes = ['./data', './server', './io'];

var chainLoad = function(arr, next){

    if(arr.length == 0){
        (thermo.log || console.log)('Chain loading complete');
        return next();
    }

    var r = arr.shift();
    (thermo.log || console.log)('Chain loading: '+r);
    require(r)(thermo, function(){
        // (thermo.log || console.log)('API so far: '+Object.keys(thermo));
        chainLoad(arr, next);
    });
};

chainLoad(includes, function(){
    thermo.start(ready);
});

function ready() {
    console.log('Awaiting Connections');
}