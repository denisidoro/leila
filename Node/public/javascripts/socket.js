function initSocket() {

	socket = io();

	// Define custom emit function with log
	socket.emitWithLog = function(tag, msg, from, customLogMsg) {
		customLogMsg = customLogMsg || msg;
		logToTable(tag, customLogMsg, from);
		socket.emit(tag, msg);
	}

	socket.on('response', function(msg) {
		logToTable('serverResponse', msg, 'Server');
	});

}
