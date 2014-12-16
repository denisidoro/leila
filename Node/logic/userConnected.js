module.exports = function(io, five, board, hex) {

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
	            //console.log(['eval', string]);
	            try {
	                eval(string); 
	            } catch (e) {
	                if (e instanceof SyntaxError) {
	                    console.log(['eval error', e.message]);
	                }
	            }
	        });

	        socket.on('hexapodConfigChange', function(hex) {
	        	hexapod.IK.move(null, null, null, [hex.baseRotX, hex.baseRotY, hex.baseRotZ]);
	            io.emit('response', 'New angles sent to servos');
	        });

	    }

	});

}