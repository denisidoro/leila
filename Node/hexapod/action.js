// Libraries
const tween  = require("tween.js");

var Action = {

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

	animatedMove: function(start, end, duration, fps, ease) {

		var duration = duration || 1000;
		var ease = tween.Easing.linear;
		var fps = fps || 8;

		var t = new tween.Tween(serialize(start))
			.to(serialize(end), duration, ease)
			.onUpdate(function() {
		  		var data = unserialize(this);
			    //console.log(data);
			    hex.Servo.moveAll(data);
			})
			.start();

		animate();

		function animate(){
			tween.update();
		    var count = 0;
		    var timer = setInterval(function() {  
		    	tween.update();
				count++;
		    	if (count >= fps * duration/1000)
		    		clearInterval(timer); 
		    }, duration/fps);
		}	
		
		function serialize(obj) {
			if (!obj.pos)
				obj = {pos: obj};
			var objS = [];
			for (var i = 0; i < obj.pos.length; i++)
				objS.push(obj.pos[i]);
			objS.push(obj.speed || hex.Servo.defaultSpeed);
			return objS;
		}

		function unserialize(objS) {
			var obj = {pos: [], speed: objS[objS.length - 2]};
			for (var i = 0; i < objS.length - 1; i++)
				obj.pos.push(objS[i]);
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
