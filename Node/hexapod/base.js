var Servo = hex.Servo,
  Motion = hex.Motion,
  Accel = hex.Accel;

var Base = {

  init: function() {
    Servo.add(18); // add 18 servos
    Motion.init();
    console.log('Hexapod initialized');
  },

  getServo: function(id) {
  	return Servo.get(id);
  },

  getAccel: function() {
    return Accel.meterPerSecSec;
  },

  invert: function(invert) {
    Servo.invert = (typeof invert == 'undefined') ? !Servo.invert : invert;
  }

};

module.exports = Base;
