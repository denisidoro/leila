var Base = {

  init: function() {
    hex.Servo.add(18);	             // add 18 servos
    hex.Motion.initHexapod();
    console.log('Hexapod initialized');
  },

  getServo: function(id) {
  	return hex.Servo.list[id];
  },

	rotation: [0, 0, 0],
	position: [0, 0, 0],
  speed: [0, 0 , 0],
  acceleration: [0, 0, 0],
  upsideDown: false

};


module.exports = Base;