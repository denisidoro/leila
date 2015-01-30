$(document).ready(function() {

	// Socket
	var socket;
	initSocket();

	// GUI
	initGUI();

	// 3D model
	var model, render;

	// Gamepad
	window.gamepad = new Gamepad();
	initGamepad();

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

	$(document).ready(function(){ 
 		$("#main-holder").onepage_scroll({
 			direction: 'horizontal',
		    beforeMove: function(index) {
		      console.log(index);
		      if (index == 3)
		      	$("#threejs").removeClass('preview');
		      else if (index == 1)
		      	$("#threejs").addClass('preview');
		    }
 		});
 		init3d();
	});

});