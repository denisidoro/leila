var utils = require('./utils'),
  Servo = utils.require('servo'),
  Motion = utils.require('motion');

var Base = {

  init: function() {
    Servo.add(18); // add 18 servos
    Motion.init();
    console.log('Hexapod initialized');
  },

  getServo: function(id) {
  	return Servo.get(id);
  },

	rotation: [0, 0, 0],
	position: [0, 0, 0],
  speed: [0, 0, 0],
  acceleration: [0, 0, 0],
  upsideDown: function(invert) {
    Servo.invert = invert;
  }

};

module.exports = Base;
