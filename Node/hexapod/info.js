var Info = {

  init: function(periodicUpdates) {

    hex.Servo.add(18);	             // add 18 servos

    if (periodicUpdates) {

		var intervals = [];
		intervals[c.POSITION]     	= 1000;
		intervals[c.SPEED] 		  	= 1000,
		intervals[c.LOAD] 			= 5000,
		intervals[c.VOLTAGE] 	  	= 10000,
		intervals[c.TEMPERATURE]  	= 25000,
		intervals[c.MOVING] 		= 1000,

	  	intervals.forEach(function(interval, code) {
	    	setInterval(function() { Info.requestUpdate(code); }, interval);
	    });

    }

    console.log('Hexapod initialized');

  },

  requestUpdate: function(code) {
  	if (board.isReady)
  		board.io.sysex(c.READ_AX12, code || c.POSITION);
  	console.log('updating ' + code);
  },

  updateCallback: function(res) {

    var callback = {
      //42: Info.sayHello
    };

    if (callback[res.code])
      callback[res.code](res.data);
    else
    	hex.Servo.set(res.code, res.data);

  	console.log('updateCallback ' + res.code);

  },

  servos: function(code) {
  	return hex.Servo.get(code);
  },

	base: {
	  rotation: [0, 0, 0],
	  position: [0, 0, 0],
	},

  log: function(data) {
      console.log(data);
      io.emit('response', data);
  }

};


module.exports = Info;