var Action = {

	easing: require("./easing.js"),

	timedMove: function(data) {

		function setTimeouts(i) {
		  setTimeout(function() { 
		  	//console.log(data[i].pos);
		    hex.Servo.moveAll(data[i].pos, data[i].speed);
		    //console.log(data[i])
		  }, data[i].time);
		}

		for (var i = 0; i < data.length; i++) {
			setTimeouts(i);
		}

	},

	timedMoveMicro: function(data) {
		
		function nowMicro() {
			var time = process.hrtime();
			return (time[0] * 1e9 + time[1]) / 1000;
		}

		var first = nowMicro();
		var i = 0;

		while (i < data.length) {
		  var now = nowMicro();
		  if (now - first > data[i].time * 1000) {
			//console.log(data[i].pos);		    
			hex.Servo.moveAll(data[i].pos, data[i].speed);
			i++;
		  }
		}

	},

	animatedMove: function(start, end, duration, fps, ease) {

		var duration = duration || 1000;
		var ease = ease || 'linear';
		var fps = fps || 8;

		function easeNorm(a, b, x, xMax) {
			return a + (b - a) * Action.easing[ease](x) / Action.easing[ease](xMax);
		}

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

		//console.log(data);
		Action.timedMoveMicro(data);
		return data;

		function parametrize(obj) {
			if (!obj.pos)
				obj = {pos: obj, speed: hex.Servo.defaultSpeed};
			return obj;
		}

	},

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

	swap: function(x) {
		
		var y = [];

		for (var i = 0; i < x.length; i += 2) {
			y.push(x[i + 1]);
			y.push(x[i]);
		}

		return y;

	}

}

module.exports = Action;
