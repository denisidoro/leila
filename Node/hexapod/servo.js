var Servo = function(id) {

    this.id = (typeof id == 'undefined') ? Servo.list.length : id;
    this.motor = null;

    this.move = function(pos, speed) {

      try {

        if (!this.motor)
          throw new Error("Motor " + this.id + " not assigned"); 
        else if (speed <= 0 || pos < 0 || pos > 1023)
          throw new Error("Impossible position or speed for motor " + this.id);

        this.motor.setRegisterValue("movingSpeed", speed || Servo.defaultSpeed);

        //console.log(pos);
        this.motor.setRegisterValue("goalPosition", Math.floor(pos));

      }

      catch (err) {
        console.log(["MotorError", err.message]);
        //console.table(["MotorError", err.message]);
        return false;
      }

    }

};

Servo.list = [];
Servo.defaultSpeed = 256;

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

// diff in microsecods
Servo.moveAll = function(pos, speed, diff) {

  // Treat case where input is only one object
  if (pos.pos) {
    pos = pos.pos;
    speed = pos.speed;
    diff = pos.diff;
  }

  try {

    if (Servo.list.length < pos.length)
      throw new Error("Not enough motors");

    if (hex.Base.upsideDown) {
      pos = hex.Action.reflect(pos, true);
      if (Array.isArray(speed))
        speed = hex.Action.swap(speed);
    }

    var diff = diff || 20000;
    var i = 0, old = 0;
    while (i < pos.length) {
        var time = process.hrtime();
        var timeMicro = Math.floor((time[0] * 1e9 + time[1])/1000);
        if (timeMicro - old > diff) {
            Servo.get(i).move(pos[i], (Array.isArray(speed) ? speed[i] : speed));
            old = timeMicro;
            i++;
            if (pos[i] < 0 || (Array.isArray(speed) && speed[i] <= 0))
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
