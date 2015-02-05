var utils = require('./utils'),
  Servo = utils.require('servo'),
  temporal = require('temporal');


// Init buffer array
var temporals = {};
var lastPos = [];
for (var i = 0; i < 18; i++)
	lastPos.push(512);

var onComplete = function() {
	console.log('onComplete');
}

var temporalTask = function(kf) {

	if (kf.fn) {
		try {
			//console.log(kf.fn);
			module.parent.exports.Movement[kf.fn].apply(this, kf.args || []);
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

		if (data.back) {
			for (var i = initialNPoints - 2; i >= 0; i--) {
				data.keyframes.push(data.keyframes[i]);
				data.points.push(data.points[data.points.length - 1] + data.points[i + 1] - data.points[i]);
			}
		}

		if (!data.points)
			data.points = [0, 1];

		if (!data.duration)
			data.duration = data.points[data.points.length - 1];
		data.points = normalize(data.points);

		data.points.forEach(function(p, i) {
			if (i >= data.keyframes.length)
				return false;
			time = (data.startingTime || 0) + p * data.duration;
			var tdatai = {
				task: function() {
					temporalTask(data.keyframes[i]);
				}
			};
			tdatai[data.loop ? 'loop' : 'delay'] = time - previousTime;
			tdata.push(tdatai);
			previousTime = time;
		})

		temporals[data.tag || 'default'] = temporal.queue(tdata);

	},

	stop: function(tag) {

		var tag = tag || 'default';

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

	}

};

module.exports = Animation;