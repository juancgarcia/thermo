var
http = require("http"),
url = require('url'),
fs = require('fs');

module.exports = function(api, next){
    console.log("LOADING SERVER FOR SERIOUS!!!");
    api = api || {};
    api.config = api.config || {};

    var server = http.createServer(function(request, response){
        console.log('Connection');
        var path = url.parse(request.url).pathname;
        // console.log("partial path: " + path);
        var fullpath = __dirname + path;
        // console.log("fullpath: " + fullpath);

        // switch(path){
        //     case '/':
        //         response.writeHead(200, {'Content-Type': 'text/html'});
        //         response.write('hello world');
        //         break;
        //     case '/sock.html':
        //     case '/socket.html':
                fs.readFile(fullpath, function(error, data){
                    if (error){
                        response.writeHead(404);
                        response.end("opps this doesn't exist - 404");
                    }
                    else{
                        response.writeHead(200, {"Content-Type": "text/html"});
                        response.end(data, "utf8");
                    }
                });
            //     break;
            // default:
            //     response.writeHead(404);
            //     response.end("opps this doesn't exist - 404");
            //     break;
        // }
        // response.end();
    });
    
    // var io = require('socket.io')('http');
    // var server = require('http').createServer();

    var start = function(next){
        server.listen( api.config.port || 8081);
        if(next) next();
    }

    api.server = server;
    api.start = start;

    if(next) next();
}