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

	//console.log('kf');
	//console.log(kf);

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
		//console.table(data);

		if (data.back) {
			for (var i = initialNPoints - 2; i >= 0; i--) {
				data.keyframes.push(data.keyframes[i]);
				data.points.push(data.points[data.points.length - 1] + data.points[i + 1] - data.points[i]);
			}
		}

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