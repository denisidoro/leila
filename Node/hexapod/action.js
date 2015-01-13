var Action = {

	easing: require("./easing.js"),

	timedMove: function(data) {

		function setTimeouts(i) {
		  setTimeout(function() { 
		  	//console.log(data[i].pos);
		    hex.Servo.moveAll(data[i].pos, data[i].speed);
		  }, data[i].time);
		}

		for (var i = 0; i < data.length; i++) {
			setTimeouts(i);
		}

	},

	timedMoveMicro: function(data) {
		
		function nowMicro() {
			var time = process.hrtime();
			return time[0] * 1e9 + time[1];
		}

		var first = nowMicro();
		var i = 0;

		while (i < data.length) {
		  var now = nowMicro();
		  if (now - first > data[i].time*1e6) {
			//console.log(data[i].pos)		    
			hex.Servo.moveAll(data[i].pos, data[i].speed);
			i++;
		  }
		}

	},

	animatedMove: function(start, end, duration, fps, ease) {

		var duration = duration || 1000;
		var ease = Action.easing.linear;
		var fps = fps || 8;

		var totalFrames = fps * duration/1000;
		var data = [];
		start = parametrize(start);
		end = parametrize(end);

		console.log(start);

		for (var i = 0; i <= totalFrames; i++) {
			var current = {pos: [], speed: 0};
			for (var j = 0; j < start.pos.length; j++) 
				current.pos.push(ease(start.pos[j] + (end.pos[j] - start.pos[j])*i/totalFrames));
			current.speed = ease(start.speed + (end.speed - start.speed)*i/totalFrames)
			data.push({
				time: Action.easing.linear(duration*i/totalFrames*0.95), 
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

	reflect: function(pos) {

		if (Array.isArray(pos)) {
			for (var i = 0; i < pos.length; i++)
			  pos[i] = Action.reflect(pos[i]);
			return pos;
		}
		else
			return 1023 - pos;

	}

}

module.exports = Action;
