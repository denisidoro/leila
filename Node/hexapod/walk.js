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

	this.reset = function(gamepad) {

		self.gamepad = gamepad || true;
		self.group = 1;
		self.isWalking = false;
		self.lastAngle = -1;
		self.lastRadius = -1;
		self.stepTime = 3000;
		self.stepSize = 100;
		self.count = 0;

		//*** 
		self.smartHeight = 100;
		//***

		Animation.reset();
		Motion.init();

	}

	this.setParams = function(obj) {
		for (p in obj)
			self[p] = obj[p];
	}

	this.WalkLeila = function(direction, n_steps) {

		self.reset();
		
		for (var i = 0; i < n_steps; i++) {
			var firstOrLast = (i == 0 || i == n_steps - 1);
			self.step(direction, 10 + i*self.stepTime, firstOrLast, false, false, false);
		}

	}

	this.update = function(radius, angle) {

		//console.log(['update', self.isWalking, self.lastRadius, self.lastAngle]);

		var first = (self.count == 0);

		if (first && radius < eps)
			return false;

		if (first || self.isWalking) {
			self.lastRadius = radius;
			self.lastAngle = angle;
			//console.log('update vars only');
			if (self.isWalking) return false;
		}

		var last = (self.lastRadius < eps); // last
		
        self.setParams({stepTime: scale(self.lastRadius, 0, Math.sqrt(2) * 0.95, 1500, 450)});
		self.step([0, self.lastAngle], 10, [first, last], false, false, false);

	}

	this.setWalkingFalse = function(time) {
		console.log(time);
		var t = setTimeout(function() {
			
			//console.log('\tisfalse: ' + (new Date()).getTime())
			self.isWalking = false;
			
			//console.log(['setFalse', self.gamepad, self.lastRadius, eps]);
			if (self.gamepad && self.lastRadius > eps)
				self.update();						

		}, time);
	}



	this.step = function(direction, startingTime, firstLast, base_angles, leg_angles, n_points, touch) {

		console.log(['step', self.count, direction, self.stepTime, firstLast]);

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
		if (math.size(direction).length == 1) 
			direction = [direction];
		if (math.size(direction)[0] >= i + 1) {
			phi = math.subset(direction, math.index(i, 0));
			theta = math.subset(direction, math.index(i, 1));
			step = [self.stepSize*Math.cos(theta)*Math.sin(phi)*(-1), 
			        self.stepSize*Math.cos(theta)*Math.cos(phi), 
			        self.stepSize*Math.sin(theta)];
		}

		if (firstLast[0] || firstLast[1]) {
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

		if(!touch)
			Motion.tripodStep(self.group, uf, xf, rf, self.stepTime, startingTime, n_points);

		if(touch){
			if(!n_points) n_points = 5;
			var heights = [];
    		for(var i = 0; i < n_points; i++){
      			if(i == 0) heights[i] = 0;
      			else heights[i] = self.smartHeight;
      		}
      		if(self.count == 0)
      			Motion.tripodStep(self.group, uf, math.add(xf, [0, 0, self.smartHeight]), rf, self.stepTime, startingTime, n_points, heights);
      		Motion.descendGroup(self.group, self.count == 0 ? startingTime + self.stepTime + 1000 : 100);
		}

		self.count += 1;
		if (firstLast[1])
			self.reset(self.gamepad);

    }

	// constructor
	self.reset(gamepad);


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

	    var delta_x_base = [0, 0, -dx];
	    var xf = [];

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
	          //console.log("CHAMANDO myInterval")
	          //console.log("descendingLegs")
	          //console.log(descendingLegs)
	          state = Motion.getState(true);
	          U = state.U, r = state.r, x = state.x;

	          move = [];
	          for(var k = 0; k < descendingLegs.length; k++){
	            displacement_down.push([0, 0, -dx]);
	            move.push(movingLegs[descendingLegs[k]]);
	          }
	          //if(descendingLegs.length != 3) delta_x_base = [0,0,0];
	          if(true) delta_x_base = [0,0,0];
	          xf = math.add(x, delta_x_base);
	          U_down = Motion.getNewLegPositions(move, displacement_down, U);
	          if(descend) 
	            Motion.moveTo(xf, r, U_down, dt-30, 5); 

	        var wait_move = setTimeout(function(){
	        //console.log("CHAMANDO WAIT MOVE")
	          //*************************

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
	            //console.log("LEG = ")
	            //console.log(descendingLegs[n]);
	            //console.log(descendingLegs)
	            if( (((Math.abs(current_load1[descendingLegs[n]]) - Math.abs(previous_load1[descendingLegs[n]])) > 50)  
	                    && (Math.abs(current_load1[descendingLegs[n]]) > Math.abs(previous_load1[descendingLegs[n]])))
	                    ||
	                    (((Math.abs(current_load2[descendingLegs[n]]) - Math.abs(previous_load2[descendingLegs[n]])) > 200)  
	                    && (Math.abs(current_load2[descendingLegs[n]]) > Math.abs(previous_load2[descendingLegs[n]])))
	                     ) {
	                newDescendingLegs.splice(n, 1);
	                //console.log("PAROU A PATAAAAAA")
	                //console.log(descendingLegs[n]);
	                //console.log("AQUIIIII **************************************************************")
	                //console.log(load1);
	                //Servo.moveAll(position);
	                //console.log([load1, load2])
	                if(newDescendingLegs.length == 0){
	                  descend = false;
	                  //console.log("PAROU TUUUUDO")
	                  //console.log("LOAD 1")
	                  //console.log(load1);
	                  //console.log("LOAD 2")
	                  //console.log(load2);
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
	//***************************************************************************************************
	//***************************************************************************************************


};

module.exports = Walk;
