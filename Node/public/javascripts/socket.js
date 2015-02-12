function initSocket() {

	socket = io();

	// Define custom emit function with log
	socket.emitWithLog = function(tag, msg, from, logMsg) {
		logMsg = logMsg || msg;
		logToTable(tag, logMsg, from);
		socket.emit(tag, msg);
	}

	// Define custom log function
	console.table = function(data) {
		console.log(data);
		logToTable('log', data);
	}

	// Initialization
	socket.on('init', function(msg) {

		//console.log(msg);

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
		if (!msg)
			return;
		console.log(msg);
		logToTable('serverResponse', msg, 'Server');
	});

	// Generic Arduino response
	socket.on('sysexResponse', function(msg) {
		logToTable('sysexResponse', msg, 'Arduino');
	});

	// Motor added
	socket.on('addMotor', function(data) {

		var msg = "";
		if (data.count <= 1)
			msg = "Started adding servos";
		else if (data.count == 18)
			msg = "All 18 servos added";

		if (msg)
			logToTable('motor', msg, 'Motors');

	});

	// Motor value updated
	//socket.on('valueUpdated', function(data) {
    	//console.log('motor value updated');
    	//console.log(data);
    //});

	// Servo.moveall called
	// maybe remove it when valueUpdated is implemented?
	socket.on('moveAll', function(data) {
		//console.log(data.pos);
    	model.animate(data.pos);
    });

    // moveTo finished, get new state
	socket.on('state', function(data) {
    	model.animate([data.x[0]/50, data.x[2] + 4, data.x[1]/100 - 0]); // temporary
    });

}
