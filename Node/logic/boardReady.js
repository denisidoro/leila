module.exports = function(io, five, board, hexapod) {

	board.on('ready', function() {

	    console.log('board ready');
	    io.emit('response', 'Board is now ready!');

	    this.io.on('sysexResponse', function(res) {
	        console.log(['sysex response', res]);
	        io.emit('sysexResponse', res);
	    });

		hexapod.IK.move();

	});

}