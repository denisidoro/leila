/* ==============
   INIT
============== */
const COXA_LENGTH = 4;
const FEMUR_LENGTH = 2;
const TIBIA_LENGTH = 3;

var math = require("mathjs");
var L = [COXA_LENGTH, FEMUR_LENGTH, TIBIA_LENGTH];


/* ==============
   Servo
============== */

var Servo = function(id) {
    this.id = (typeof id == 'undefined') ? Servo.servos.length : id;
    this.moving = false;
    this.position = 512;
    this.speed = 0;
};

Servo.servos = [];

Servo.setBoard = function(board) {
  Servo.board = board;
}
  
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
    Servo.board.io.sysex(0x00, pos);
    Servo.setPositions(pos);
  }
  Servo.board.io.sysex(0x00, Servo.getPositions());
}


/* ==============
   BASE
============== */

var Base = {
  rotation: {x: 0, y: 0, z: 0},
  position: {x: 0, y: 0, z: 0}
};


/* ==============
   IK
============== */

var IK = {
  
  baseMovement: function(bRot, bPos) {
    Servo.servos.forEach(function(s, i) {
      s.position = i;
    });
    Base.rotation = bRot;
    Base.position = bPos;
  },

  test: function() {
    return math.ones(4);
  },

  leg: function (i, xBase, xLeg, u, angles) {

    xBase = xBase || math.zeros(3);
    xLeg = xLeg || math.zeros(3);
    u = u || math.zeros(3);
    angles = angles || math.zeros(3);

    var t;
    t = math.subset(angles, math.index(2));
    var C = math.matrix([
      [Math.cos(t), Math.sin(t), 0], 
      [-Math.sin(t), Math.cos(t), 0], 
      [0, 0, 1]
    ]);
    t = math.subset(angles, math.index(1));
    var B = math.matrix([
      [1, 0, 0], 
      [0, Math.cos(t), Math.sin(t)], 
      [0, -Math.sin(t), Math.cos(t)]
    ]);
    t = math.subset(angles, math.index(0));
    var A = math.matrix([
      [Math.cos(t), Math.sin(t), 0], 
      [-Math.sin(t), Math.cos(t), 0], 
      [0, 0, 1]
    ]);
    var R = math.multiply(C, math.multiply(B, A));

    var s1 = math.subtract(xLeg, xBase);
    var l = math.subtract(math.add(xBase, math.multiply(R, s1)), u);
    console.log(math.multiply(l, math.multiply(R, [0, 1, 0])));
    var alpha = Math.atan(math.dot(l, math.multiply(R, [0, 1, 0]))/math.dot(l, math.multiply(R, [1, 0, 0])));

    var s2 = math.matrix([
      math.subset(s1, math.index(0)) + ((-1)^i)*L[0]*Math.cos(alpha),
      math.subset(s1, math.index(1)) + ((-1)^i)*L[0]*Math.sin(alpha),
      math.subset(s1, math.index(2))
    ]);

    var l1 = math.add(xBase, math.multiply(R, s2)); // CHECK
    var div = math.sqrt(math.subset(l1, math.index(0))^2 + math.subset(l1, math.index(1))^2);
    var p = Math.atan(math.subset(l1, math.index(2))/div);
    var phi = Math.asin((math.subset(l1, math.index(2)) - math.subset(l, math.index(2)))/L[0]);

    var beta = Math.acos((L[1]^2 + math.norm(l1)^2 - L[2]^2)/(2*L[1]*math.norm(l1))) - (p + phi);
    var gamma = math.pi - Math.acos(((L[1]^2) + (L[2]^2 - math.norm(l1)^2))/(2*L[1]*L[2]));

    return [alpha, beta, gamma, p, phi];

  }
  
};


/* ==============
   ASSOCIATIONS
============== */
exports.init = function(board, math) { 
  Servo.setBoard(board); 
  return exports; 
}
exports.Servo = Servo;
exports.Base = Base;
exports.IK = IK;
