var ease = require('ease-component');
var Servo = hex.Servo;


// buffers

const MAX_BUFFER_SIZE = 50;
var buffer = []; 


// task execution

var timeoutCallback = function(kf, animation, remaining) {

	if (!kf)
		return;

	if (kf.fn) {
		try {
			var args = [];
			if (kf.args)
				args = Array.isArray(kf.args) ? kf.args : [kf.args];
			var r = hex.Movement[kf.fn].apply(this, args);
			if (Array.isArray(r)) {
				delete kf.fn; delete kf.args;
				kf.pos = r;
				return timeoutCallback(kf, animation);
			}
		}
		catch (e) {
			console.log(e);
		}
		return;
	}

	else if (kf.easing) {
		var data = easeData(kf.start, kf.pos, kf.points, kf.duration, kf.easing);
		Animation.create('ease').play(data);
		return;
	}

	else if (kf.data) {
		Animation.create('subtask').play(kf.data);
		return;
	}

	if (!kf.pos)
		kf = {pos: kf};

	var pos = [];
	for (var i = 0; i < Servo.list.length; i++) {
		var p = interpret(kf.pos, i);
		pos.push(p);
	}

	Servo.moveAll(pos, kf.speed);
	
	return;

}

function interpret(a, i) {

	if (!(i in a) || a[i] == null)		// don't move
		return -1;				
	else if (a[i].to)	// absolute
		return a[i].to;		
	else if (a[i].step)	// relative
		return Servo.get(i).feedback.presentPosition + a[i].step;
	else				// absolute
		return a[i];

}

// treat data

function treatData(data) {

	if (!data.points)
		data.points = [0, 1];

	if (!data.duration)
		data.duration = data.points[data.points.length - 1];
	data.points = normalize(data.points);

	//data = integrateSubtasks(data); // warning
	return data;

}

function normalize(points) {

	var r = [];

	points.forEach(function(cp) {
		r.push(cp/points[points.length - 1]);
	})

	return r;

}


// easing

function easeData(start, end, points, duration, easing) {

	var start = start || Servo.getFeedback('presentPosition', 512);
	var points = points || 2;
	var duration = duration || 500*points;
	var easing = easing || 'linear';

	var data = {
		duration: duration,
		points: [],
		keyframes: []
	};

	for (var k = 0; k <= points; k++) {

		var pos = [], speed = [];
		var t = ease[easing](k/points);

		for (var i = 0; i < 18; i++) {
			var p = start[i] + (end[i] - start[i]) * (k/points);
			pos.push(p);
			var s = k == 0 ? 1023 : hex.Motion.speedCalculation(p, data.keyframes[k-1].pos[i], (t-data.points[k-1])*duration);
			speed.push(s);
		}

		data.points.push(t);
		data.keyframes.push({pos: pos, speed: speed});

	}

	return data;

}

// buffering

function dataFromBuffer(start, end, increment) {

	var time = 0;
	var data = {points: [], keyframes: []};

	for (var i = start; end >= start ? i <= end : i >= end; i += increment) {
		//console.log([i, buffer[i-increment].time, buffer[i].time]);
		time += buffer[i-increment].time - buffer[i].time;
		data.points.push(time);
		data.keyframes.push({pos: buffer[i].pos, speed: buffer[i-increment].speed});
	}

	return data;

}


// main class

var Animation = function() {

	var self = this;
	this.timeouts = [];
	this.data = {};
	this.playTime = 0;
	this.pauseTime = 0;

	this.queue = function(data) {
		this.data = treatData(data);
	};

	this.play = function(data) {	

		if (data)
			this.queue(data);

		data = JSON.parse(JSON.stringify(this.data));
		var startingPoint = (this.pauseTime - this.playTime) / data.duration;

		if (startingPoint > 0) {
			data.duration *= (1 - startingPoint);
			data.points.forEach(function(p, i) {
				data.points[i] -= startingPoint;
			});
			data.points = normalize(data.points);
		}

		data.keyframes.forEach(function(kf, i) {
			if (data.points[i] >= startingPoint) {
				self.timeouts.push(setTimeout(function() {
					timeoutCallback(kf, self, kf.length - i + 1);
				},  Math.round((data.startingTime || 5) + data.points[i] * data.duration)));	
			}
		});

		this.playTime = (new Date()).getTime();
		this.pauseTime = 0;

	};

	this.loop = function(data, period) {
		
		if (data)
			this.queue(data);

		period = period || this.data.duration;

		self.timeouts.push(setInterval(function() {
			self.play();
		}, period));

	}

	this.pause = function() {

		this.pauseTime = (new Date()).getTime();
		Servo.moveAll(Servo.getFeedback('presentPosition'), Servo.getFeedback('presentSpeed'));
		this.stop(true);

	};

	this.stop = function(keepData) {

		this.timeouts.forEach(function(t, i) {
			clearTimeout(t);
			//clearInterval(t);
		});
		this.timeouts = [];

		if (!keepData)
			this.data = {};

	};

};


Animation.list = {};

Animation.get = function(tag) {
	return Animation.list[tag];
}

Animation.create = function(tag, keepExisting) {

	tag = tag || 'default';
	//console.log(tag);

	var a = Animation.get(tag);

	if (!a || !keepExisting) {
		if (a)
			a.stop();
		a = new Animation();
		return Animation.list[tag] = a;
	}

	return a;

}

Animation.all = function(fn) {
	for (var tag in Animation.list) {
		Animation.get(tag)[fn]();
	}
}

Animation.reset = function() {
	Animation.all('stop');
	Animation.list = {};
	Animation.clearBuffer();
}

Animation.clearBuffer = function() {
	buffer = [];
}

Animation.updateBuffer = function(pos, speed) {

	var now = (new Date()).getTime();

	if (!Array.isArray(speed)) {
		var s = speed;
		speed = [];
		for (var i = 0; i < 18; i++)
			speed[i] = s;
	}

	for (var i = 0; i < 18; i++) {
		if (!pos[i] || pos[i] < 0)
			pos[i] = buffer[buffer.length - 1].pos[i];
		if (!speed[i] || speed[i] < 0) {
			var prevSpeed = buffer.length > 1 ? buffer[buffer.length - 1].speed : Servo.defaultSpeed;
			speed[i] = buffer.length == 0 ? Servo.defaultSpeed : (Array.isArray(prevSpeed) ? prevSpeed[i] : prevSpeed);
		}
	}

	buffer.push({pos: pos, speed: speed, time: now});

	if (buffer.length > MAX_BUFFER_SIZE)
		buffer.shift();

};

Animation.rewind = function(target, loop) {
	if (!target || target > buffer.length)
		target = buffer.length;
	Animation.redo(buffer.length - 2, buffer.length - target, -1, loop);
}

Animation.replay = function(target, loop) {
	if (!target || target > buffer.length)
		target = buffer.length;
	Animation.redo(buffer.length - target + 1, buffer.length - 1, 1, loop);
}

Animation.redo = function(start, end, increment, loop) {

	var data = dataFromBuffer(start, end, increment);

	Animation.reset();
	var a = Animation.create('redo');
	a.queue(data);

	return loop == true ? a.loop() : a.play();

}

module.exports = Animation;