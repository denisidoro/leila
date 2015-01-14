module.exports = function() {

	io.on('connection', function(socket) {

	    console.log('a user connected');

	    var appDir = require('path').dirname(require.main.filename);
	    var fs = require('fs');
        var path = appDir + "/../.git/FETCH_HEAD";
        var date = fs.existsSync(path) ? fs.statSync(path).mtime : 0;
	    io.emit('init', {samples: fs.readdirSync(appDir + "/public/samples"), date: date});
	    
	    socket.on('disconnect', function() {
	        console.log('a user disconnected');
	    });

        socket.on('eval', function(string) {
            //console.log(['eval', string]);
            string = "try {" + string + "} catch(codeError) { console.log(codeError); }";
            try {
                eval(string); 
            } catch (e) {
                if (e instanceof SyntaxError) {
                    console.log(['eval error', e.message]);
                }
            }
        });

        socket.on('moveServo', function(data) {
            hex.Servo.list[data.id].move(data.pos, 150);
        });

        socket.on('baseChange', function(data) {
            hex.Motion.baseMove(hex.Motion.degreesToRadians([data.rotX, data.rotY, data.rotZ]));
        });

        socket.on("updateRegister", function(d){
            var motorid = d.motor;
            var registerName = d.register;
            var value = d.value;
            hex.Servo.list[motorid - 1].motor.setRegisterValue(registerName,value);
        });

	});

}