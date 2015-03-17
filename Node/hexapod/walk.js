var utils = require('./utils'),
  Motion = utils.require('motion');

var math  = require("mathjs");
var eps = 0.4; 

// stepSize, n_steps, direction, stepTime, startingTime, base_angles, leg_angles, n_points, gamepad

var Walk = function(gamepad) {

	var self = this;

	this.reset = function(gamepad) {
		//console.log('reset');
		self.gamepad = gamepad;
		self.group = 1;
		self.isWalking = false;
		self.prevRadius = -1;
		self.stepTime = 1000;
		self.stepSize = 50;
		self.count = 0;
	}

	this.setParams = function(stepTime, stepSize) {
		if (stepTime)	self.stepTime = stepTime;
		if (stepSize)	self.stepSize = stepSize;
	}

	this.start = function(direction, n_steps) {
		
		for (var i = 0; i < n_steps; i++) {
			var firstOrLast = (i == 0 || i == n_steps - 1);
			self.step(direction, 10 + i*self.stepTime, firstOrLast, false, false, false);
		}

	}

	this.update = function(radius, angle) {

		//console.log('update');
		//console.log(['prevRad', self.prevRadius, radius])

		if (self.isWalking) {
			self.prevRadius = radius;
			//console.log(['stop', radius]);
			return false;
		}

		//self.setParams(1000, 120); // change

		var firstOrLast = ((self.prevRadius < 0 || (self.prevRadius < eps && radius >= eps)) || // first
			(self.prevRadius > 0 && self.prevRadius < eps || self.prevRadius >= eps && radius < eps)); // last
		
		self.step([0, 0], 10, firstOrLast, false, false, false);

	}

	this.step = function(direction, startingTime, firstOrLast, base_angles, leg_angles, n_points) {

		//console.log('step');

		// get state
		var state = Motion.getState(true);
		//console.log(state)
		var U = state.U, r = state.r, x = state.x;
		delete state;

		self.isWalking = true;
    	self.setWalkingFalse(self.stepTime);   

	    direction = Motion.degreesToRadians(direction);
		//console.log(['newdir', direction]);
	    if (base_angles) 	base_angles = Motion.degreesToRadians(base_angles);
	    if (leg_angles)		leg_angles = Motion.degreesToRadians(leg_angles);
	    var movingLegs = [];
	    var xf;
	    var rf;
	    var ui = [];
	    var uf = [];
	    var aux = [];
	    var phi = 0;
	    var theta = 0;
	    var step = [];
	    var delta_r = [];
	    var R = [];   

	    var i = 0;
		if (math.size(direction).length == 1)  // ESTRELASSSSSSSSSSSSSSSSSSSSSSSSSS
			direction = [direction];
		//console.log(direction);
		if (math.size(direction)[0] >= i + 1) {
			phi = math.subset(direction, math.index(i, 0));
			theta = math.subset(direction, math.index(i, 1));
			step = [self.stepSize*Math.cos(theta)*Math.sin(phi)*(-1), 
			        self.stepSize*Math.cos(theta)*Math.cos(phi), 
			        self.stepSize*Math.sin(theta)];
		}

		if (firstOrLast) {
			delta_u = math.multiply(0.5, step);
			delta_x = math.multiply(0.25, step);
		}
		else {
			delta_u = step;
			delta_x = math.multiply(0.5, step);
		}

		self.group = !self.group;
		movingLegs = (!self.group ? [0, 3, 4] : [1, 2, 5]);

		// Getting initial positions of moving legs
		for (var j = 0; j < 3; j++){
			aux = math.subset(U, math.index(movingLegs[j], [0,3]));
			aux = math.squeeze(aux);
			ui[j] = aux;
		}

		// Calculating final positions of moving legs
		xf = math.add(x, delta_x);
		r = math.squeeze(r);

		if (base_angles)
			rf = [math.subset(r, math.index(0)), math.subset(r, math.index(0)), base_angles];
		else
			rf = math.clone(r);

		if (leg_angles)
			R = Motion.rotationXYZ([0, 0, leg_angles]);
		else
			R = Motion.rotationXYZ([0,0,0]);

		for (var j = 0; j < 3; j++){
			uf[j] = math.add(ui[j], delta_u);
			uf[j] = math.subtract(uf[j], xf);
			uf[j] = math.transpose(uf[j]);
			uf[j] = math.multiply(R, uf[j]);
			uf[j] = math.squeeze(uf[j]);
			uf[j] = math.add(uf[j], xf);
			uf[j] = math.subtract(uf[j], ui[j]); // delta_u instead of uf, tripodStep() takes the variation
			uf[j] = math.squeeze(uf[j]);
		}

		//console.log([self.group, uf, xf, rf, self.stepTime, startingTime, n_points]);
		//console.log([self.group, direction]);
		Motion.tripodStep(self.group, uf, xf, rf, self.stepTime, startingTime, n_points);
		//console.log('call walk');

		self.count += 1;
		if (firstOrLast && self.count > 1)
			self.reset(self.gamepad);

    }

	this.setWalkingFalse = function(time) {
		setTimeout(function() {
			
			self.isWalking = false;
			//console.log('it is now false');	
			
			//if (self.prevRadius > eps)
				//self.update();						

		}, time);
	}

	// constructor
	self.reset(gamepad);

};

module.exports = Walk;
