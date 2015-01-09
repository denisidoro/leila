var debug = require('debug')('Node');

var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

var MotorSystem = require('Dynanode/MotorSystem');
var ms = new MotorSystem();

var routes = require('./routes/index');

var app = express();

app.set('port', process.env.PORT || 3000);

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

//----- Socket.io Responses --------------
io.sockets.on('connection', function (socket) {
    
    //On Connect: Send Motors + Registers
    var mtrs = ms.getMotors();
    for(var i=0; i<mtrs.length; i++) {
        socket.emit("addMotor",{id:mtrs[i].getID()});
        socket.emit("addRegisters",{id:mtrs[i].getID(),registers:mtrs[i].listRegisters()});
    }
    
    socket.on("updateRegister",function(d){
        var motorid = d.motor;
        var registerName = d.register;
        var value = d.value;
        hex.Servo.list[motorid - 1].motor.setRegisterValue(registerName,value);
    });
            
});


//------ Motor System Operation ---------
ms.on("motorAdded",function(m) {
    console.log("motor added - "+m.motor.getID());
    var mid = m.motor.getID();
    hex.Servo.assignMotor(m.motor);
    
    io.sockets.emit("addMotor",{id:m.motor.getID()});
    io.sockets.emit("addRegisters",{id:m.motor.getID(),registers:m.motor.listRegisters()});
    
    m.motor.on("valueUpdated",function(d) {
        io.sockets.emit("valueUpdated",{id:mid,register:d.name,value:d.value});
    });
});

ms.on("motorRemoved",function(m) {
    console.log("motor removed - "+m.id);
    hex.Servo.list[m.id - 1].motor = null;
    io.sockets.emit("removeMotor",{id:m.id});
});

ms.init();


// Set globals
global.io = io;
global.c = require('./hexapod/constants.js');
global.hex = {
    Servo: require('./hexapod/servo.js'),
    IK: require('./hexapod/ik.js'),
    Base: require('./hexapod/base.js')
};

require('./events/userConnected')();


console.table = function(msg) {
    console.log(msg);
    io.emit('response', msg);
}

hex.Base.init();
