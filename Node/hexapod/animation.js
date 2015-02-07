var utils = require('./utils'),
  Servo = utils.require('servo'),
  temporal = require('temporal');

// Init buffer array
var temporals = {};
var lastPos = [];
for (var i = 0; i < 18; i++)
	lastPos.push(512);
var tag = 'default';
var bufferData = {};
var lastTime = 0;

const MAX_BUFFER_SIZE = 10;
var buffer = [];


var temporalTask = function(kf) {

	//console.log('kf');
	//console.log(kf);
	if (!kf)
		return false;

	if (kf.fn) {
		try {
			//console.log(kf.fn);
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

	if (!kf.pos)
		kf = {pos: kf};

	var pos = [];
	for (var i = 0; i < Servo.list.length; i++) {
		var p = interpret(kf.pos, i, -1, lastPos);
		if (p > 0)
			lastPos[i] = p;
		pos.push(p);
	}

	//console.log(bufferData);
	bufferData.points.shift();
	bufferData.keyframes.shift();
	Servo.moveAll(pos, kf.speed);
	//console.log(pos);

}

function interpret(a, i, defaultValue, previousValueArray) {

	if (!(i in a))			// don't move
		return defaultValue;				
	else if (a[i].to)		// absolute
		return a[i].to;		
	else if (a[i].step)		// relative
		return previousValueArray[i] + a[i].step;
	else					// absolute
		return a[i];

}

function integrateSubtasks(data) {

	data.keyframes.forEach(function(k, i) {
		if (k.data) {
			// remove data[i], add k.data to data
			if (k.duration)
				k.data.duration = k.duration;
			var d = treatData(k.data);
			var startingTime = data.points[i];
			data.keyframes.splice(i, 1);
			data.points.splice(i, 1);
			for (var j = 0; j < d.keyframes.length; j++) {
				data.points.splice(i + j, 0, startingTime + d.points[j]*d.duration/data.duration);
				data.keyframes.splice(i + j, 0, d.keyframes[j]);
			}
		}
	})

	data.points = normalize(data.points);
	return data;

}

function treatData(data, duration) {

	if (!data.points)
		data.points = [0, 1];

	if (!data.duration)
		data.duration = data.points[data.points.length - 1];
	data.points = normalize(data.points);

	data = integrateSubtasks(data); // warning
	return data;

}

function normalize(points) {
	var r = [];
	points.forEach(function(cp) {
		r.push(cp/points[points.length - 1]);
	})
	return r;
}

var Animation = {

	queue: function(data) {

		var tdata = [], time = 0, previousTime = 0;
		var initialNPoints = data.keyframes.length;

		data = treatData(data);
		//console.log(data);

		data.points.forEach(function(p, i) {
			if (i >= data.keyframes.length)
				return false;
			time = (data.startingTime || 0) + p * data.duration;
			var tdatai = {
				task: function() {
					temporalTask(data.keyframes[i]);
				}
			};
			tdatai[data.loop ? 'loop' : 'delay'] = Math.round(time - previousTime);
			tdata.push(tdatai);
			previousTime = time;
		});

		lastTime = (new Date()).getTime();
		bufferData = JSON.parse(JSON.stringify(data));
		temporals[tag] = temporal.queue(tdata);

	},

	pause: function() {

		lastTime = (new Date()).getTime() - lastTime;
		Servo.moveAll(Servo.getFeedback('presentPosition'), Servo.getFeedback('presentSpeed'));
		//console.log(temporals);
		Animation.stop();

	},

	rewind: function(target) {

		if (!target || target > buffer.length)
			target = buffer.length;

		var time = 0;
		var data = {points: [], keyframes: []};

		for (var i = buffer.length - 2; i >= buffer.length - target; i--) {
			//console.log([i, buffer[i].time, buffer[i+1].time]);
			time += buffer[i+1].time - buffer[i].time;
			data.points.push(time);
			data.keyframes.push({pos: buffer[i].pos, speed: buffer[i+1].speed});
		}

		//console.log(data);

		Animation.stop();
		Animation.queue(data);

	},

	resume: function(target) {

		if (!target || target > bufferData.length)
			target = bufferData.length;

		var startingPoint = lastTime/bufferData.duration;
		bufferData.duration *= (1 - startingPoint);
		bufferData.points.forEach(function(p, i) {
			bufferData.points[i] -= startingPoint;
		});
		bufferData.points = normalize(bufferData.points);

		var data = bufferData;
		//console.log(data);

		Animation.stop();
		Animation.queue(data);

	},

	play: function(target) {

		if (target < 0)		// reverse movement
			this.rewind(-target);
		else				// continue movement
			this.resume(target);

	},

	stop: function() {

		//console.log(temporals);

		if (tag == 'all') {
			temporals.forEach(function(t) {
				t.stop();
			});
			temporals = {};
			return true;
		}

		if (!temporals[tag])
			return false;

		//console.log(temporals[tag]);
		temporals[tag].stop();
		delete temporals[tag];

	},

	updateBuffer: function(pos, speed) {

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

		//console.log([pos, speed]);
		//console.log('------');

		buffer.push({pos: pos, speed: speed, time: now});

		if (buffer.length > MAX_BUFFER_SIZE)
			buffer.shift();

	},

	getBuffer: function() {
		return buffer;
	}

};

module.exports = Animation;