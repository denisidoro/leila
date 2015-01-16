// Object

var configs = new function() {
	this.base = {};
	this.servos = {};
}

configs.base = {
	rotX: 0, rotY: 0, rotZ: 0, 
	posX: 0, posY: 0, posZ: 110,
	stepSize: 150, walkAngle: 0
};

for (var i = 0; i < 18; i++)
	configs.servos['servo' + i] = 512;

// GUI

var gui;

function initGUI() {

	gui = new dat.GUI();

	gui.f1 = gui.addFolder('Base');
	
	// rotation
	var controllers = [];
	controllers.push(gui.f1.add(configs.base, 'rotX', -20, 20));
	controllers.push(gui.f1.add(configs.base, 'rotY', -20, 20));
	controllers.push(gui.f1.add(configs.base, 'rotZ', -20, 20));
	controllers.push(gui.f1.add(configs.base, 'posX', -150, 150));
	controllers.push(gui.f1.add(configs.base, 'posY', -150, 150));
	controllers.push(gui.f1.add(configs.base, 'posZ', -150, 150));
	$.each(controllers, function(i, c) {
		c.listen().onFinishChange(function(value) {
			socket.emitWithLog('stateChange', configs.base);
		});
	});

	// walking
	controllers = [];
	controllers.push(gui.f1.add(configs.base, 'stepSize', 30, 200));
	controllers.push(gui.f1.add(configs.base, 'walkAngle', 0, 360));
	$.each(controllers, function(i, c) {
		c.listen().onFinishChange(function(value) {
			socket.emitWithLog('tripodSimpleWalk', configs.base);
		});
	});

	gui.f2 = gui.addFolder('Servos');
	var controllers = [];

	for (var i = 0; i < 18; i++)
		controllers.push(gui.f2.add(configs.servos, 'servo' + i, 0 + 100, 1023 - 100).step(1));

	$.each(controllers, function(i, c) {
		c.listen().onFinishChange(function(value) {
			socket.emitWithLog('moveServo', {id: i, pos: value});
		});
	});

	gui.f1.open();
  
};

function initGamepadGUI() {

	gui.gamepadStarted = true;

	gui.f3 = gui.addFolder('Controller');
	var controllers = [];

	for (var p in gamepad.gamepads[0].state) {
		if (p.toLowerCase().indexOf('stick') != -1 || p.toLowerCase().indexOf('bottom_shoulder') != -1)
			controllers.push(gui.f3.add(gamepad.gamepads[0].state, p, -1, 1));
		else
			controllers.push(gui.f3.add(gamepad.gamepads[0].state, p, false));
	}

	$.each(controllers, function(i, c) {
		c.listen();
	});

}
