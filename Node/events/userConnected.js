module.exports = function() {

	io.on('connection', function(socket) {

	    console.log('a user connected');

	    var appDir = require('path').dirname(require.main.filename);
	    var fs = require('fs');
	    io.emit('init', {ready: board.isReady, samples: fs.readdirSync(appDir + "/public/samples"), date: fs.statSync(appDir + "/../.git/FETCH_HEAD").mtime});
	    
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

	    if (board.isReady) {

	        console.log('board socket response functions defined');

	        socket.on('hexapodConfigChange', function(c) {
	        	// c = {rotX, rotY, rotZ, forward, rigth}
	        	// rot in degrees
	        	// forward, right in the range [-4, 4]
	        	// 4 is the max speed in the considered way
	        	// -4 is the max speed in the opposite way
	        	// TODO: what to call here?
	        	// hex.IK.what(c);
	            io.emit('response', 'New angles sent to servos');
	        });

	    }

	});

}