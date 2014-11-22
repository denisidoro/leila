console.log('-----');

var board = {};


function Servo(id) {
    this.id = (typeof id == 'undefined') ? Servo.servos.length : id;
    this.moving = false;
    this.position = 512;
    this.speed = 0;
};

Servo.servos = [];
  
Servo.add = function(n) {
  n = n || 1;
  for (var i = 0; i < n; i++)
    Servo.servos.push(new Servo());
};

Servo.remove = function(index) {
  Servo.servos.splice(index, 1);
};

Servo.getPositions= function(pos) {
  var positions = [];
  Servo.servos.forEach(function(s, i) {
    positions.push(s.position);
  });
  return positions;
}

Servo.setPositions= function(pos) {
  Servo.servos.forEach(function(s, i) {
    s.position = pos[i];
  });
}

Servo.sendToArduino = function(pos) {
  if (!pos) {
    //board.io.sysex(0x00, pos);
    Servo.setPositions(pos);
  }
  //board.io.sysex(0x00, Servo.getPositions());
}

Servo.prototype.hi = function() {
  console.log('hi');
}



var Base = {
  rotation: {x: 0, y: 0, z: 0},
  position: {x: 0, y: 0, z: 0}
};



var IK = {
  
  baseMovement: function(bRot, bPos) {
    Servo.servos.forEach(function(s, i) {
      s.position = i;
    });
    Base.rotation = bRot;
    Base.position = bPos;
  }
  
};




Servo.add(4);
console.log(Servo.getPositions());
IK.baseMovement([3,4,5], [3,4,5]);
console.log(Servo.getPositions());
console.log(Base.rotation);

