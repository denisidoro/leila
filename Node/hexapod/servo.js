var utils = require('./utils'),
  servoUtils = require('./servoUtils');

var Servo = function(id) {

    this.id = (typeof id == 'undefined') ? Servo.list.length : id;
    this.motor = null;

    this.move = function(pos, speed) {

      try {

        if (!this.motor)
          throw new Error("Motor " + this.id + " not assigned"); 
        else if (speed < 0 || speed > 1023 || pos < 0 || pos > 1023)
          throw new Error("Impossible position or speed for motor " + this.id + ": [" + pos + ", " + speed + "]");

        this.motor.setRegisterValue("movingSpeed", Math.floor(speed) || Servo.defaultSpeed);
        this.motor.setRegisterValue("goalPosition", Math.floor(pos));

      }

      catch (err) {
        //console.log(["MotorError", err.message]);
        //console.table(["MotorError", err.message]);
        return false;
      }

    }

};


// Static properties
Servo.list = [];
Servo.defaultSpeed = 256;
Servo.lastMovement = 0;
Servo.minimumGap = 100;
Servo.invert = false;
Servo.init = false;

Servo.assignMotor = function(m) {
  //console.log(['assign', m]);
  Servo.list[m.getID() - 1].motor = m;
}

Servo.get = function(id) {
  return Servo.list[id];
}
  
Servo.add = function(n) {
  n = n || 1;
  for (var i = 0; i < n; i++)
    Servo.list.push(new Servo());
};

Servo.remove = function(index) {
  Servo.list.splice(index, 1);
};

/**
 * Move all servos
 * @param  int[]        pos       array of positions for each servo
 * @param  int, int[]   speed     speed for all servos or an array of speeds for each servo
 * @param  int          diff      time between the movement of two servos
 * @return bool         success   false in case of an error
 */
Servo.moveAll = function(pos, speed, diff) {

  // Treat case where input is only one object
  if (pos.pos) {
    speed = pos.speed;
    diff = pos.diff;
    pos = pos.pos;
  }

  //console.log(pos);

  try {

    if (Servo.invert) {
      pos = servoUtils.reflect(pos, true);
      if (Array.isArray(speed))
        speed = servoUtils.swap(speed);
    }

  	io.emit('moveAll', {pos: pos, speed: speed});

    if (Servo.list.length < pos.length)
      throw new Error("Not enough motors");

    var diff = diff || 20000;
    var keys = Object.keys(pos);
    var i = 0, old = 0;

    while (i < keys.length) {
        if (pos[key] < 0 || (Array.isArray(speed) && speed[key] <= 0))
          i++;
        var key = keys[i];
        var time = process.hrtime();
        var timeMicro = Math.floor((time[0] * 1e9 + time[1])/1000);
        if (timeMicro - old > diff) {
            Servo.get(key).move(pos[key], (Array.isArray(speed) ? speed[key] : speed));
            old = timeMicro;
            i++;
        }
    }

  }

  catch (err) {
    console.table(["MotorError", err.message]);
    return false;
  }

}


module.exports = Servo;
