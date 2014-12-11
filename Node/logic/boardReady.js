
module.exports = function(io, five, board, hex) {

	board.on('ready', function() {

	    console.log('board ready');
	    io.emit('response', 'Board is now ready!');

	    this.io.on('sysexResponse', function(res) {
	        console.log(['sysex response', res]);
	        io.emit('sysexResponse', res);
	        hex.Info.updateCallback(res);
	    });

	    //board.io.sysex(0xA0, [1, 555], [1], true);

	});

}