var Action = {

	timedMove: function(data) {

		function setTimeouts(i) {
		  setTimeout(function() { 
		  	console.log(data[i].pos);
		    hex.Servo.moveAll(data[i].pos, data[i].speed);
		  }, data[i].time);
		}

		for (var i = 0; i < data.length; i++) {
			setTimeouts(i);
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
