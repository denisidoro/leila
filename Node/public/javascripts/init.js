$(document).ready(function() {

	// GUI
	initGUI();

	// Gamepad
	window.gamepad = new Gamepad();
	initGamepad();

	// Socket
	var socket;
	initSocket();

	$('#samples').on('change', function() {
		$.get("/samples/" + this.value, function(content) {
			editor.setValue(content + (content ? '\n' : ''), Number.MAX_VALUE);
			editor.focus();
		});
	});

	logToTable('init', 'Initialization finished', 'Server');

	window.onbeforeunload = function() {
    	return 'Are you sure you want to quit?';
	};

});