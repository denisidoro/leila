var utils = require('./utils'),
  Servo = utils.require('servo'),
  ease = require('component-ease'),
  temporal = require('temporal');


// Init buffer array
var lastPos = [];
var lastSpeed = [];
for (var i = 0; i < 18; i++) {
	lastPos.push(512);
	lastSpeed.push(0);
}


var onComplete = function() {
	console.log('onComplete');
}

var temporalTask = function(kf) {

	if (!kf.pos)
		kf = {pos: kf};

	var pos = [], speed = [];
	for (var i = 0; i < Servo.list.length; i++) {
		var p = interpret(kf.pos, i, -1, lastPos[i]);
		lastPos[i] = p;
		pos.push(p);
		if (kf.speed) {
			var s = interpret(kf.speed, i, Servo.defaultSpeed, lastSpeed[i]);
			lastSpeed[i] = s;
			speed.push(p);
		}
	}

	Servo.moveAll(pos, speed);

}

function interpret(a, i, defaultValue, previousValue) {

	if (!(i in a))			// don't move
		return defaultValue;				
	else if (a[i].to)		// absolute
		return a[i].to;		
	else if (a[i].step)		// relative
		return previousValue + a[i].step;
	else					// absolute
		return a[i];

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

		console.log(data);

		var tdata = [], time = 0, previousTime = 0;

		if (!data.duration)
			data.duration = data.points[data.points.length - 1];
		data.points = normalize(data.points);

		data.points.forEach(function(p, i) {
			time = p * data.duration;
			tdata.push({
				delay: time - previousTime,
				task: function() {
					temporalTask(data.keyframes[i]);
				}
			})
			previousTime = time;
		})

		temporal.queue(tdata);

	}

};

module.exports = Animation;