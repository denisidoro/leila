var gui;

function initGUI() {

	gui = new dat.GUI();

	gui.f1 = gui.addFolder('Hexapod');
	var controllers = [];

	controllers.push(gui.f1.add(hexapod, 'baseRotX', -90, 90));
	controllers.push(gui.f1.add(hexapod, 'baseRotY', -90, 90));
	controllers.push(gui.f1.add(hexapod, 'baseRotZ', -90, 90));

	$.each(controllers, function(i, c) {
		c.listen().onFinishChange(function(value) {
			socket.emitWithLog('hexapodConfigChange', hexapod, false, ['rot', i, value]);
		});
	});

	gui.f1.open();
  
};

function initGamepadGUI() {

	gui.gamepadStarted = true;

	gui.f2 = gui.addFolder('Controller');
	var controllers = [];

	for(var p in gamepad.gamepads[0].state) {
		if (p.toLowerCase().indexOf('stick') != -1 || p.toLowerCase().indexOf('bottom_shoulder') != -1)
			controllers.push(gui.f2.add(gamepad.gamepads[0].state, p, -1, 1));
		else
			controllers.push(gui.f2.add(gamepad.gamepads[0].state, p, false));
	}

	$.each(controllers, function(i, c) {
		c.listen();
	});

}
