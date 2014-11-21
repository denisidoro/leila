function scale(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// Emit a message to the server and log it to the table
function logToTable(tag, msg, from) {

	// Input checkup
	from = from || "Here";
	if (typeof msg == 'undefined') {
		msg = tag; tag = "-";
	}
	if (!(typeof msg == 'string' || msg instanceof String))
		msg = JSON.stringify(msg);

	// Date string generation
	now = new Date();
	var date = [now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()];
	$.each(date, function(i, e) {
		if (e.toString().length == 1)
			date[i] = '0' + date[i];
	})
	var dateString =  date.shift() + 'h' + date.join(':');

	// Prepend to table
	$("#log-table").prepend("<tr><td>" + $('#log-table tr').length + "</td><td>" + dateString + "</td><td>" + from + "</td><td>" + tag + "</td><td>" + msg + "</td></tr>");
	
}

/* ===================
   TEMP
=================== */

function randomLED() {
	socket.emitWithLog('turnLED', [true, false][Math.round(Math.random())]);
}

function callA2() {
	socket.emitWithLog('callA2');
}