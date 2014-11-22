function initSocket() {

	socket = io();

	// Define custom emit function with log
	socket.emitWithLog = function(tag, msg, from, logMsg) {
		logMsg = logMsg || msg;
		logToTable(tag, logMsg, from);
		socket.emit(tag, msg);
	}

	socket.on('response', function(msg) {
		logToTable('serverResponse', msg, 'Server');
	});

	socket.on('sysexResponse', function(msg) {
		logToTable('sysexResponse', msg, 'Arduino');
	});

}
