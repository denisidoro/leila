// Object

var configs = new function() {
	this.base = {};
	this.servos = {};
}

configs.base = {
	rotX: 0, rotY: 0, rotZ: 0, 
	posX: 0, posY: 0, posZ: 0,
	stepSize: 150, walkAngle: 0,
	changeStateTime: 1000
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
	controllers.push(gui.f1.add(configs.base, 'posX', -40, 40));
	controllers.push(gui.f1.add(configs.base, 'posY', -40, 40));
	controllers.push(gui.f1.add(configs.base, 'posZ', -40, 40));
	$.each(controllers, function(i, c) {
		c.listen().onChange(function(value) {
			console.log('change base');
			socket.emit('changeState', configs.base);
		});
	});
	controllers.push(gui.f1.add(configs.base, 'changeStateTime', 500, 2500));

	// walking
	controllers = [];
	controllers.push(gui.f1.add(configs.base, 'stepSize', 30, 200));
	controllers.push(gui.f1.add(configs.base, 'walkAngle', 0, 360));
	$.each(controllers, function(i, c) {
		c.listen().onChange(function(value) {	
			console.log('walk')
			socket.emit('walk', configs.base);
		});
	});

	gui.f2 = gui.addFolder('Servos');
	var controllers = [];

	var limits = [
		[270, 750],
		[100, 980],	// [205, 615]
		[100, 980]	// [24, 512]
	];

	for (var i = 0; i < 18; i++)
		controllers.push(gui.f2.add(configs.servos, 'servo' + i, limits[i%3][0], limits[i%3][1]).step(1));

	$.each(controllers, function(index, c) {
		c.listen().onChange(function(value) {
			var pos = [];
			for (var i = 0; i < 18; i++)
				pos.push(configs.servos['servo' + i]);
			model.move(pos);
			socket.emit('moveServo', {id: index, pos: value});
		});
	});

	/*
	gui.f4 = gui.addFolder('3D');

	gui.f4.add(camera, 'fov', 1, 30).step(1).onChange(function(value) {
  		camera.updateProjectionMatrix();
	});
	*/

	//gui.f1.open();
  
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
