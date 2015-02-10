var ease = require('ease-component');
var utils = require('./utils'),
  c = utils.require('constants'),
  Servo = utils.require('servo');


const MAX_BUFFER_SIZE = 10;
var buffer = [];  


// task execution

var timeoutCallback = function(kf, animation) {

	if (!kf)
		return;

	if (kf.fn) {
		try {
			var args = [];
			if (kf.args)
				args = Array.isArray(kf.args) ? kf.args : [kf.args];
			module.parent.exports.Movement[kf.fn].apply(this, args);
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
	}

	if (!kf.pos)
		kf = {pos: kf};

	var pos = [];
	for (var i = 0; i < Servo.list.length; i++) {
		var p = interpret(kf.pos, i);
		pos.push(p);
	}

	animation.data.points.shift();
	animation.data.keyframes.shift();
	Servo.moveAll(pos, kf.speed);
	
	return;

}

function interpret(a, i) {

	if (!(i in a))		// don't move
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
	var duration = duration || 1000;
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
			var s = k == 0 ? 1023 : ((p - data.keyframes[k - 1].pos[i]) / ((t - data.points[k - 1])  * duration/1000)) * (0.3*1023/c.MAX_SERVO_SPEED);
			speed.push(s);
		}

		data.points.push(t);
		data.keyframes.push({pos: pos, speed: speed});

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

		data = this.data;

		if (this.pauseTime != 0) {
			var startingPoint = (this.pauseTime - this.playTime) / data.duration;
			data.duration *= (1 - startingPoint);
			data.points.forEach(function(p, i) {
				data.points[i] -= startingPoint;
			});
			data.points = normalize(data.points);
		}

		data.keyframes.forEach(function(kf, i) {
			self.timeouts.push(setTimeout(function() {
				timeoutCallback(kf, self);
			}, Math.round((data.startingTime || 5) + data.points[i] * data.duration)));
		});

		this.playTime = (new Date()).getTime();
		this.pauseTime = 0;

	};

	this.pause = function() {

		this.pauseTime = (new Date()).getTime();
		Servo.moveAll(Servo.getFeedback('presentPosition'), Servo.getFeedback('presentSpeed'));
		this.stop();

	};

	this.stop = function(keepData) {

		this.timeouts.forEach(function(t, i) {
			clearTimeout(t);
		});

		this.timeouts.shift();

		if (!keepData) {
			this.data = {};
		}

	};

};


Animation.list = {};

Animation.get = function(tag) {
	return Animation.list[tag];
}

Animation.create = function(tag, keepExisting) {

	tag = tag || 'default';

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
			var prevSpeed = buffer[buffer.length - 1].speed;
			speed[i] = buffer.length == 0 ? Servo.defaultSpeed : (Array.isArray(prevSpeed) ? prevSpeed[i] : prevSpeed);
		}
	}

	buffer.push({pos: pos, speed: speed, time: now});

	if (buffer.length > MAX_BUFFER_SIZE)
		buffer.shift();

};

Animation.rewind = function(target) {

	if (!target || target > buffer.length)
		target = buffer.length;

	var time = 0;
	var data = {points: [], keyframes: []};

	for (var i = buffer.length - 2; i >= buffer.length - target; i--) {
		time += buffer[i+1].time - buffer[i].time;
		data.points.push(time);
		data.keyframes.push({pos: buffer[i].pos, speed: buffer[i+1].speed});
	}

	Animation.all('stop');
	Animation.create('rewind').play(data);

}


module.exports = Animation;