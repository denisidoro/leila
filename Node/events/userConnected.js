module.exports = function() {

	io.on('connection', function(socket) {

	    console.log('a user connected');

	    var appDir = require('path').dirname(require.main.filename);
	    var fs = require('fs');
        var path = appDir + "/../.git/index";
        var date = fs.existsSync(path) ? fs.statSync(path).mtime : 0;
	    io.emit('init', {samples: fs.readdirSync(appDir + "/public/samples"), date: date});

        var check = function() {
            //if (!hex.Servo.init)
            //    return false;
            var now = Date.now();
            //console.log([now, hex.Servo.lastMovement]);
            if (now - hex.Servo.lastMovement < hex.Servo.minimumGap) {
                //console.log('TOO QUICK: ' + Math.random());
                return false;
            }
            hex.Servo.lastMovement = now;
            return true;
        }
	    
	    socket.on('disconnect', function() {
	        console.log('a user disconnected');
	    });

        socket.on('eval', function(string) {
            //console.log(['eval', string]);
            string = "try {" + string + "\n} catch(codeError) { console.log(codeError); }";
            try {
                eval(string); 
            } catch (e) {
                if (e instanceof SyntaxError) {
                    console.log(['eval error', e.message]);
                }
            }
        });

        socket.on('moveServo', function(data) {
            if (!check())
                return false;
            try {
                hex.Animation.stop();
-               hex.Servo.get(data.id).move(data.pos, 150);
            } catch(e) {
                console.log(e);
            }
        });

        socket.on('changeState', function(data) {
            //console.log('changeState');
            if (!check())
                return false;
            try {
                hex.Animation.stop();
                hex.Motion.resetFrames();
                var p = [data.posX, data.posY, data.posZ];
                //var r = hex.Motion.degreesToRadians([data.rotX, data.rotY, data.rotZ]);
                var r = [data.rotX, data.rotY, data.rotZ];
                hex.Motion.moveTo(p, r, null, data.changeStateTime, 5);
            }
            catch(e) {
                console.log(e);
            }
        });

        socket.on('tripodSimpleWalk', function(data) {
            if (!check())
                return false;   
            try {
                hex.Animation.stop();
                hex.Motion.tripodSimpleWalk(data.stepSize, 1, data.walkAngle, 1000);
            }
            catch(e) {
                console.log(e);
            }
        });

        socket.on("updateRegister", function(d){
            var motorid = d.motor;
            var registerName = d.register;
            var value = d.value;
            hex.Servo.get(motorid - 1).motor.setRegisterValue(registerName,value);
        });

	});

}