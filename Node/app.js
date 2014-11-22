var debug = require('debug')('Node');

var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

var five = require("johnny-five"),
    board = new five.Board();

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

var io = require('socket.io').listen(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

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




/* ================
   MINE
================ */


board.on('ready', function() {

    console.log('board ready');
    io.emit('response', 'Board is now ready!');

    this.io.on('sysexResponse', function(res) {
        console.log(['sysex response', res]);
    });

});


io.on('connection', function(socket) {

    console.log('a user connected');
    io.emit('response', ['Hello', board.isReady]);
    
    socket.on('disconnect', function() {
        console.log('a user disconnected');
    });

    if (board.isReady) {

        console.log('board socket response functions defined');
        var led13 = new five.Led(13);

        socket.on('toggleLED', function() {
            led13.toggle();
            io.emit('response', 'LED change complete');
        });

        socket.on('callA2', function() {
            console.log('call 0x81');
            board.io.sysex(0x81);
        });

        socket.on('callBlink', function(times) {
            console.log('call 0x80');
            board.io.sysex(0x80, [13, times, 2]);
        });

        socket.on('eval', function(string) {
            console.log(['eval', string]);
            try {
                eval(string); 
            } catch (e) {
                if (e instanceof SyntaxError) {
                    console.log(['eval error', e.message]);
                }
            }
        });

    }

});
