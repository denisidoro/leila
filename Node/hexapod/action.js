var timeouts = [];

var Action = {

	easing: require("./easing.js"),

	/**
	 * Execute an array of movements asynchronously
	 * @param  object 	data                      array of objects containing the time of execution and array of positions
	 * @param  bool		continuePreviousMovements false to stop previous movements
	 * @return void
	 */
	timedMove: function(data, continuePreviousMovements) {

		if (!continuePreviousMovements) {
			timeouts.forEach(function(e, i) {
				clearTimeout(e);
			})
			timeouts = [];
		}

		function setTimeouts(i) {
		  var t = setTimeout(function() { 
		  	//console.log(data[i].pos);
		    hex.Servo.moveAll(data[i].pos, data[i].speed);
		    //console.log(data[i])
		  }, data[i].time);
		  timeouts.push(t);
		}

		for (var i = 0; i < data.length; i++) {
			setTimeouts(i);
		}

	},

	animatedMove: function(start, end, duration, fps, ease) {

		var duration = duration || 1000;
		var ease = ease || 'linear';
		var fps = fps || 8;

		var totalFrames = fps * duration/1000;
		var data = [];
		start = parametrize(start);
		end = parametrize(end);

		for (var i = 0; i <= totalFrames; i++) {
			var current = {pos: [], speed: 0};
			for (var j = 0; j < start.pos.length; j++) 
				current.pos.push(easeNorm(start.pos[j], end.pos[j], i, totalFrames));
			current.speed = easeNorm(start.speed, end.speed, i, totalFrames);
			data.push({
				time: duration*i/totalFrames*0.98, 
				pos: current.pos, 
				speed: current.speed
			});
		}

		Action.timedMove(data);
		return data;

		function easeNorm(a, b, x, xMax) {
			return a + (b - a) * Action.easing[ease](x) / Action.easing[ease](xMax);
		}

		function parametrize(obj) {
			if (!obj.pos)
				obj = {pos: obj, speed: hex.Servo.defaultSpeed};
			return obj;
		}

	},

	// get complementar angles
	reflect: function(x, swap) {

		if (swap)
			x = Action.swap(x);

		if (Array.isArray(x)) {
			for (var i = 0; i < x.length; i++)
			  x[i] = Action.reflect(x[i]);
			return x;
		}
		else
			return 1023 - x;

	},

	// swap information for moveAll() in case of reflection
	swap: function(x) {
		var y = [];
		for (var i = 0; i < 18; i++)
			y.push(x[i + ((i%3)%2 == i%2 ? 3 : -3)]);
		return y;
	}

}

module.exports = Action;
