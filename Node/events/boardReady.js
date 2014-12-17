
module.exports = function(hex) {

	board.on('ready', function() {

		hex.Info.init(false);
	    console.log('board ready');
	    io.emit('response', 'Board is now ready!');

	    this.io.on('sysexResponse', function(res) {
	        console.log(['sysex response', res]);
	        io.emit('sysexResponse', res);
	        hex.Info.updateCallback(res);
	    });

	});

}