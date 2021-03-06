var Motion = hex.Motion,
	Animation = hex.Animation;
var math  = require("mathjs");

var c = hex.c,
  Servo = hex.Servo,
  Animation = hex.Animation;

var eps = 0.4; 

// helpers

function scale(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// stepSize, n_steps, direction, stepTime, startingTime, base_angles, leg_angles, n_points, gamepad

var Walk = function(gamepad) {

	var self = this;

	this.reset = function(time) {
		console.log('reset');
		setTimeout(function() {
			self.last = false;
			self.shouldMove = false;
			self.stepCount = 0;
			Animation.reset();
			Motion.init();
		}, time || 0);
	}

	this.reset2 = function(time){		
		var state = Motion.getState(true);
		//console.log(state)
		var U = state.U, r = state.r, x = state.x;

		console.log('reset');
		setTimeout(function() {
			self.last = false;
			self.shouldMove = false;
			self.stepCount = 0;
			Animation.reset();
			if (!x || x != []) Motion.init([0, 0, math.subset(x, math.index(2))]);
			else Motion.init();
		}, time || 0);
	}

	this.resetAll = function() {
		self.group = 1;
		self.stepTime = 2500;
		self.stepSize = 100;
		self.smartHeight = 90;
		self.angle = 0;
		self.reset();
	}

	this.update = function(obj) {
		//console.log("update: (" + [self.angle.toFixed(0), self.stepTime].join(", ") + ")");
		for (p in obj)
			self[p] = obj[p];
	}

	this.walk = function(n_steps) {
		for (var i = 0; i < n_steps; i++) {
			var last = (i == n_steps - 1);
			self.step([self.angle, 0], i*(self.stepTime + 10), last, false, false);
		}
	}

	this.walkIrregular = function(n_steps) {
		for (var i = 0; i < n_steps; i++) {
			var last = (i == n_steps - 1);
			self.step([self.angle, 0], i*(self.stepTime + 10), last, false, false, true);
		}
	}

	this.toggle = function() {
		console.log("toggle: " + self.shouldMove + " -> " + !self.shouldMove);
		if (!self.shouldMove) {
			self.shouldMove = true;
			self.tryStep();
		}
		else
			self.last = true;
	}

    this.tryStep = function(last) {

        if (!self.shouldMove)
        	return false;

		self.step([self.angle, 0], 10, self.last, false, false);

		setTimeout(function() {
			self.tryStep();
		}, self.stepTime);

	}


	this.turn = function(angle, startingTime, last, relative) {

		var tempStepSize = self.stepSize;
		var state = Motion.getState(true);
		var r = state.r;

		if (relative) angle += Motion.radiansToDegrees(math.subset(r, math.index(2)));		
		self.stepSize = 0; 
		self.step([0,0], startingTime, last, angle || 0.0000001); // 0 is false, 0.00000001 is beautiful
		self.step([0,0], startingTime + self.stepTime, last, angle || 0.0000001); 

		self.stepSize = tempStepSize;

	}


	this.step = function(direction, startingTime, last, base_angles, n_points, isIrregularSurface) {

		console.log("step: (" + [startingTime, self.angle.toFixed(0), self.stepTime].join(", ") + ")");

		// OMAR, MUDAR ESSA LOGICA COMENTADA
		// get state
		var state = Motion.getState(true);
		//console.log(state)
		var U = state.U, r = state.r, x = state.x;
		delete state;

	    direction = Motion.degreesToRadians(direction);
		//console.log(['newdir', direction]);
	    if (base_angles) 	base_angles = Motion.degreesToRadians(base_angles);
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
		var Rz = [];   
	    var legDefault = [];

	    var i = 0;
		if (math.size(direction).length == 1) 
			direction = [direction];
		if (math.size(direction)[0] >= i + 1) {
			phi = math.subset(direction, math.index(i, 0));
			theta = math.subset(direction, math.index(i, 1));
			step = [self.stepSize*Math.cos(theta)*Math.sin(phi)*(-1), 
			        self.stepSize*Math.cos(theta)*Math.cos(phi), 
			        self.stepSize*Math.sin(theta)];
		}

		if (self.stepCount == 0) {
			delta_u = math.multiply(1/4, step);
			delta_x = math.multiply(0.25, step);
		}
		else if(last){
			delta_u = [0,0,0];
			delta_x = math.multiply(0.25, step);
		}
		else {
			delta_u = math.multiply(step, 1/4);
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

		Rz = Motion.rotationXYZ([0,0, math.subset(rf, math.index(2))]);

		for (var j = 0; j < 3; j++){
			legDefault = math.squeeze(math.subset(Motion.getDefaultPositions(), math.index(movingLegs[j], [0, 3] )));
			uf[j] = math.squeeze(math.multiply(Rz, legDefault))  ; // Final position 
			uf[j] = math.add(uf[j], xf);
			uf[j] = math.add(uf[j], delta_u);			
			uf[j] = math.subtract(uf[j], ui[j]); // delta_u instead of uf, tripodStep() takes the variation
		}

		if(!isIrregularSurface)
			Motion.tripodStep(self.group, uf, xf, rf, self.stepTime, startingTime, n_points);

		if(isIrregularSurface){
			if(!n_points) n_points = 5;
			var heights = [];

    		for(var i = 0; i < n_points; i++){
      			if((i == n_points - 1)  || (i == 0)) heights[i] = 0;
      			else heights[i] = Motion.getDefaultHeight() - 25;
    		}

      		Motion.tripodStep(self.group, uf, xf, rf, self.stepTime, startingTime, n_points, heights);

		}
		// this is necessary independent of the step logic
		self.stepCount += 1;
		if (last)
			self.reset2(startingTime + self.stepTime);

    }

	// constructor
	self.resetAll();


	//***************************************************************************************************
	//***************************************************************************************************
	this.descendGroup = function(i, startingTime){
		// get state
		var state = Motion.getState(true);
		//console.log(state)
		var U = state.U, r = state.r, x = state.x;

	    var descend = true;
	    var dt = 350; // in ms
	    var dx = 5; // in mm

	    var aux = [];
	    var load1 = [[], [], []];
	    var load2 = [[], [], []];
	    var position = [];
	    var current_load1 = [];
	    var previous_load1 = [];
	    var current_load2 = [];
	    var previous_load2 = []; 
	    var count;


	    var movingLegs = [];
	    if(i == 0) movingLegs = [0, 3, 4];
	    else movingLegs = [1, 2, 5];
	    var descendingLegs = [0, 1, 2]; // Index of the legs in movingLegs that are still descending
	    var newDescendingLegs = [];
	    var move = [];

	    var U_down = [];
	    var displacement_down = [];

	    var waitToStart = setTimeout( function(){

	    //**************************************************************************************************
	        var myInterval = setInterval(function(){
	          state = Motion.getState(true);
	          U = state.U, r = state.r, x = state.x;

	          move = [];
	          for(var k = 0; k < descendingLegs.length; k++){
	            displacement_down.push([0, 0, -dx]);
	            move.push(movingLegs[descendingLegs[k]]);
	          }
	          U_down = Motion.getNewLegPositions(move, displacement_down, U);
	          if(descend) 
	            Motion.moveTo(x, r, U_down, dt-30, 5); 

	        var wait_move = setTimeout(function(){

	          aux = Servo.getFeedback('presentLoad');
	          position = Servo.getFeedback('presentPosition');

	          for(var m = 0; m < movingLegs.length; m++){
	            if(descendingLegs.indexOf(m) != -1){
	              load1[m].push(aux[3*movingLegs[m] + 1]);
	              load2[m].push(aux[3*movingLegs[m] + 2]);

	              previous_load1[m] = current_load1[m];
	              current_load1[m] = load1[m][load1[m].length - 1];

	              previous_load2[m] = current_load2[m];
	              current_load2[m] = load2[m][load2[m].length - 1];
	            }
	          }

	          count =  descendingLegs.length;
	          newDescendingLegs = Motion.clone(descendingLegs);
	          for(var n = 0; n < count; n++){

	            if( (((Math.abs(current_load1[descendingLegs[n]]) - Math.abs(previous_load1[descendingLegs[n]])) > 30)  
	                    && (Math.abs(current_load1[descendingLegs[n]]) > Math.abs(previous_load1[descendingLegs[n]])))
	                    ||
	                    (((Math.abs(current_load2[descendingLegs[n]]) - Math.abs(previous_load2[descendingLegs[n]])) > 200)  
	                    && (Math.abs(current_load2[descendingLegs[n]]) > Math.abs(previous_load2[descendingLegs[n]])))
	                     ) {
	                newDescendingLegs.splice(n, 1);

	                if(newDescendingLegs.length == 0){
	                  descend = false;
	                  clearTimeout(wait_move);
	                  clearInterval(myInterval);
	                  descendingLegs = Motion.clone(newDescendingLegs);
	                  break; 
	                }
	              }
	          }
	          descendingLegs = Motion.clone(newDescendingLegs);

	            }, dt - 20);
	            //*************************

	        }, dt);
	    //******************************************************************************************************************
	     }, startingTime);

  }

};

module.exports = Walk;
