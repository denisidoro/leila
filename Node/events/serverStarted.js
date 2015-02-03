module.exports = function() {

    // Motor system

    var MotorSystem = require('dynanode/MotorSystem');
    var ms = new MotorSystem();
    var count = 0;

    ms.on("motorAdded",function(m) {
        
        var id = m.motor.getID();
        count++;
        
        io.emit("addMotor", {id: id, count: count});
        hex.Servo.assignMotor(m.motor);
        
        m.motor.on("valueUpdated", function(d) {
            //io.emit("valueUpdated", {id: id, register: d.name, value: d.value});
            //console.log({id: id, register: d.name, value: d.value})
        });

        if (count == 18) {
            hex.Movement.moveToInit();
            hex.Servo.init = true;
        }

    });

    ms.on("motorRemoved",function(m) {
        console.log("motor removed - " + m.id);
        hex.Servo.list[m.id - 1].motor = null;
        io.emit("removeMotor", {id:m.id});
    });

    // Custom functions

    console.table = function(msg) {
        console.log(msg);
        io.emit('response', msg);
    }

    // Initialization

    ms.init();
    hex.Base.init();


}