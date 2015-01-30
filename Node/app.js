var debug = require('debug')('Node');

var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();

app.set('port', process.env.PORT || 3001);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

var io = require('socket.io').listen(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

// set globals
global.io = io;
global.c = require('./hexapod/constants.js');
global.hex = {
    Servo: require('./hexapod/servo.js'),
    Motion: require('./hexapod/motion.js'),
    Base: require('./hexapod/base.js'),
    Action: require('./hexapod/action.js')
};

// event requirements
require('./events/serverStarted')();
require('./events/userConnected')();

// exit
process.on('SIGINT', function() {
    if (server != undefined) {
        console.log("closing server");
        server.close(function (e) {
            if (e) { throw 'error on closing server ' + e; }
        });
    }
});


