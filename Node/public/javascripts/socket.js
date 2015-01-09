function initSocket() {

	socket = io();

	// Define custom emit function with log
	socket.emitWithLog = function(tag, msg, from, logMsg) {
		logMsg = logMsg || msg;
		logToTable(tag, logMsg, from);
		socket.emit(tag, msg);
	}

	// Define custom log function
	console.log2 = function(data) {
		console.log(data);
		logToTable('log', data);
	}

	// Initialization
	socket.on('init', function(msg) {

		// Version date
		if (msg.date && typeof moment !== 'undefined') {
			var m = moment(msg.date);
		    $('#version').html('v' + m.format("YYYYMMDD"));
		    $('#time').html(m.format("HHmm"));
		}

	    // Populate sample selector
		if ($('#samples option').length == 0)
			populateSamplesSelect(msg.samples);

		//logToTable('init', 'board ready: ' + msg.ready, 'Server');

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
