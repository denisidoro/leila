module.exports = function() {

    // Motor system

    var MotorSystem = require('dynanode/MotorSystem');
    var ms = new MotorSystem();

    ms.on("motorAdded",function(m) {
        
        var id = m.motor.getID();
        var count = ms.length;
        
        io.emit("addMotor", {id: id, count: count});
        hex.Servo.assignMotor(m.motor);
        
        m.motor.on("valueUpdated", function(d) {
            //io.emit("valueUpdated", {id: id, register: d.name, value: d.value});
        });

        if (count == 18)
            hex.Motion.moveToInit();

    });

    ms.on("motorRemoved",function(m) {
        console.log("motor removed - " + m.id);
        hex.Servo.list[m.id - 1].motor = null;
        io.emit("removeMotor", {id:m.id});
    });

    // Initialization

    ms.init();
    hex.Base.init();

    // Custom functions

    console.table = function(msg) {
        console.log(msg);
        io.emit('response', msg);
    }

}