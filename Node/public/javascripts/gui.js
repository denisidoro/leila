// Object

var configs = new function() {
	this.base = {};
	this.servos = {};
}

configs.base = {rotX: 0, rotY: 0, rotZ: 0, forward: 0, right: 0};

for (var i = 0; i < 18; i++)
	configs.servos['servo' + i] = 512;

// GUI

var gui;

function initGUI() {

	gui = new dat.GUI();

	gui.f1 = gui.addFolder('Base');
	var controllers = [];

	controllers.push(gui.f1.add(configs.base, 'forward', -4, 4));
	controllers.push(gui.f1.add(configs.base, 'right', -4, 4));
	controllers.push(gui.f1.add(configs.base, 'rotX', -90, 90));
	controllers.push(gui.f1.add(configs.base, 'rotY', -90, 90));
	controllers.push(gui.f1.add(configs.base, 'rotZ', -90, 90));

	$.each(controllers, function(i, c) {
		c.listen().onFinishChange(function(value) {
			socket.emitWithLog('hexapodConfigChange', configs.base);
		});
	});

	gui.f2 = gui.addFolder('Servos');
	var controllers = [];

	for (var i = 0; i < 18; i++)
		controllers.push(gui.f2.add(configs.servos, 'servo' + i, 0 + 150, 1023 - 150));

	$.each(controllers, function(i, c) {
		c.listen().onFinishChange(function(value) {
			socket.emitWithLog('moveServo', {id: i, pos: value});
		});
	});

	//gui.f1.open();
  
};

function initGamepadGUI() {

	gui.gamepadStarted = true;

	gui.f2 = gui.addFolder('Controller');
	var controllers = [];

	for (var p in gamepad.gamepads[0].state) {
		if (p.toLowerCase().indexOf('stick') != -1 || p.toLowerCase().indexOf('bottom_shoulder') != -1)
			controllers.push(gui.f2.add(gamepad.gamepads[0].state, p, -1, 1));
		else
			controllers.push(gui.f2.add(gamepad.gamepads[0].state, p, false));
	}

	$.each(controllers, function(i, c) {
		c.listen();
	});

}
