var gui;

function initGUI() {

	gui = new dat.GUI();

	gui.f1 = gui.addFolder('Hexapod');
	gui.f1.add(hexapod, 'baseRotX', -90, 90).listen();
	gui.f1.add(hexapod, 'baseRotY', -90, 90).listen();
	gui.f1.add(hexapod, 'baseRotZ', -90, 90).listen();

	gui.f2 = gui.addFolder('Controller');
	for(var p in gamepad.gamepads[0].state) {
		if (p.toLowerCase().indexOf('stick') != -1 || p.toLowerCase().indexOf('bottom_shoulder') != -1)
			gui.f2.add(gamepad.gamepads[0].state, p, -1, 1).listen();
		else
			gui.f2.add(gamepad.gamepads[0].state, p, false).listen();
	}

	gui.f1.open();
  
};