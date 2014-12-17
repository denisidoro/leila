$(document).ready(function() {

	// GUI
	initGUI();

	// Gamepad
	window.gamepad = new Gamepad();
	initGamepad();

	// Socket
	var socket;
	initSocket();

	logToTable('init', 'Initialization finished', 'Server');

	$('#samples').on('change', function() {
		$.get("/samples/" + this.value, function(content) {
			editor.setValue(content + (content ? '\n' : ''), Number.MAX_VALUE);
			editor.focus();
		});
	});

});