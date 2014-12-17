module.exports = function(io, five, board, hex) {

	io.on('connection', function(socket) {

	    console.log('a user connected');

	    var samplesDirectory = require('path').dirname(require.main.filename) + "/public/samples";
	    
	    io.emit('init', {ready: board.isReady, samples: require('fs').readdirSync(samplesDirectory)});
	    
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

	        socket.on('hexapodConfigChange', function(hex) {
	        	hexapod.IK.move(null, null, null, [hex.baseRotX, hex.baseRotY, hex.baseRotZ]);
	            io.emit('response', 'New angles sent to servos');
	        });

	    }

	});

}