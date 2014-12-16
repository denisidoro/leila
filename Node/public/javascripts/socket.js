function initSocket() {

	socket = io();

	// Define custom emit function with log
	socket.emitWithLog = function(tag, msg, from, logMsg) {
		logMsg = logMsg || msg;
		logToTable(tag, logMsg, from);
		socket.emit(tag, msg);
	}

	// Initialization
	socket.on('init', function(msg) {
		logToTable('init', msg.ready, 'Server');
		populateSamplesSelect(msg.samples);
	});

	// Generic server response
	socket.on('response', function(msg) {
		logToTable('serverResponse', msg, 'Server');
	});

	// Generic Arduino response
	socket.on('sysexResponse', function(msg) {
		logToTable('sysexResponse', msg, 'Arduino');
	});

}
