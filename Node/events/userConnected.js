module.exports = function() {

	io.on('connection', function(socket) {

	    console.log('a user connected');

	    var appDir = require('path').dirname(require.main.filename);
	    var fs = require('fs');
	    io.emit('init', {samples: fs.readdirSync(appDir + "/public/samples"), date: fs.statSync(appDir + "/../.git/FETCH_HEAD").mtime});
	    
	    socket.on('disconnect', function() {
	        console.log('a user disconnected');
	    });

        socket.on('eval', function(string) {
            //console.log(['eval', string]);
            try {
                eval(string); 
            } catch (e) {
                if (e instanceof SyntaxError) {
                    console.log(['eval error', e.message]);
                }
            }
        });

        socket.on('moveServo', function(data) {
        	hex.Servo.list[data.id].move(data.pos);
        });

	});

}