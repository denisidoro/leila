function scale(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// Emit a message to the server and log it to the table
function logToTable(tag, msg, from) {

	// Input checkup
	from = from || "Here";
	if (typeof msg == 'undefined')
		msg = '';
	if (!(typeof msg == 'string' || msg instanceof String))
		msg = JSON.stringify(msg);

	// Date string generation
	now = new Date();
	var date = [now.getHours(), now.getMinutes(), now.getSeconds()];
	$.each(date, function(i, e) {
		if (e.toString().length == 1)
			date[i] = '0' + date[i];
	})
	date.push(('000' + now.getMilliseconds()).slice(-3));
	var dateString =  date.shift() + 'h' + date.join(':');

	// Prepend to table
	$("#log-table").prepend("<tr><td>" + $('#log-table tr').length + "</td><td>" + dateString + "</td><td>" + from + "</td><td>" + tag + "</td><td>" + msg + "</td></tr>");
	
}

/* ===================
   TEMP
=================== */

function toggleLED() {
	socket.emitWithLog('toggleLED');
}

function callA2() {
	socket.emitWithLog('callA2');
}

function callBlink() {
	socket.emitWithLog('callBlink', 254);
}

function sendCode() {
	socket.emitWithLog('eval', editor.getValue());
}