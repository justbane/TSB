
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , kosk = require('./routes/kosk')
  , http = require('http')
  , path = require('path')
  , cluster = require('cluster');

var numCPUs = require('os').cpus().length;
var app = express();

// Config - all environments  ------------------------------------
app.configure(function(){
    app.set('port', process.env.PORT || 8081);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public'));
    app.use(express.static(path.join(__dirname, 'public')));
});

// Development ------------------------------------
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Production ------------------------------------
app.configure('production', function(){
  app.use(express.errorHandler());
});


// Routes -----------------------------------------
app.get('/', routes.index);
app.post('/kosk', kosk.getspecials);
app.post('/users/authenticate', user.authenticate);


// Server init ------------------------------------
if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {
  // Workers can share any TCP connection
  // In this case its a HTTP server
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
}
