var Servo = function(id) {

    this.id = (typeof id == 'undefined') ? Servo.list.length : id;
    this.motor = null;

    this.move = function(pos, speed) {

      try {

        if (!this.motor)
          throw new Error ("Motor " + this.id + " not assigned"); 

        this.motor.setRegisterValue("movingSpeed", speed || Servo.defaultSpeed);
        this.motor.setRegisterValue("goalPosition", pos);

      }

      catch (err) {
        console.log(["MotorError", err.message]);
        //console.table(["MotorError", err.message]);
        return false;
      }

    }

};

Servo.list = [];
Servo.defaultSpeed = 512;

Servo.assignMotor = function(m) {
  //console.log(['assign', m]);
  Servo.list[m.getID() - 1].motor = m;
}
  
Servo.add = function(n) {
  n = n || 1;
  for (var i = 0; i < n; i++)
    Servo.list.push(new Servo());
};

Servo.remove = function(index) {
  Servo.list.splice(index, 1);
};

Servo.moveAll = function(pos, speed) {

  try {

    if (Servo.list.length < pos.length)
      throw new Error("Not enough motors");

    var i = 0;       

    function loop() {           
     setTimeout(function() { 
        Servo.list[i].move(pos[i], speed);
        i++;                    
        if (i < 18)          
           loop();
     }, 1)
    }

    loop();   

  }

  catch (err) {
    console.table(["MotorError", err.message]);
    return false;
  }

}


module.exports = Servo;
