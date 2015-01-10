var Action = {

	timedMove: function(data) {

		function setTimeouts(i) {
		  setTimeout(function() { 
		    hex.Servo.moveAll(data[i].pos, data[i].speed);
		  }, data[i].time);
		}

		for (var i = 0; i < data.length; i++) {
			setTimeouts(i);
		}

	},

	reflect: function(pos) {
		for (var i = 0; i < pos.length; i++)
		  pos[i] = 1024 - pos[i];
		return pos;
	}

}

module.exports = Action;