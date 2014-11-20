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

});