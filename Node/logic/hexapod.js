/* ==============
   INIT
============== */
const COXA_LENGTH =   69.716;   // in mm, 49.716  
const FEMUR_LENGTH =  82.9;     // in mm
const TIBIA_LENGTH =  144.448;  // in mm

const math = require("mathjs");
const L = [COXA_LENGTH, FEMUR_LENGTH, TIBIA_LENGTH];
var board;


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
    board.io.sysex(0x00, pos);
    Servo.setPositions(pos);
  }
  board.io.sysex(0x00, Servo.getPositions());
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

  move: function(xBase, xLeg, u, angles) {

    var d1 = 43.7865, 
        d2 = 91.82, 
        d = d1 + d2,
        d3 = 131.82;

    if (!u) {
      var u = [];
      u[0] = [ - d2 - 50,  d3 + 130,  - 80];
      u[1] = [ + d2 + 50, d3 + 130, - 80];
      u[2] = [ - d - 50, 0, -80];
      u[3] = [ + d + 50, 0, -80];
      u[4] = [ - d2 - 50,  - d3 - 130,  - 80];
      u[5] = [ + d2 + 50,  - d3 - 130,  - 80];
    }

    var xBase = xBase || [0, 30, 45];
    var angles = angles || [0, math.pi/2, math.pi/20];

    if (!xLeg) {
      var xLeg = [];
      xLeg[0] = [xBase[0] - d2, xBase[1] + d3, xBase[2]];
      xLeg[1] = [xBase[0] + d2, xBase[1] + d3, xBase[2]];
      xLeg[2] = [xBase[0] - d, xBase[1], xBase[2]];
      xLeg[3] = [xBase[0] + d, xBase[1], xBase[2]];
      xLeg[4] = [xBase[0] - d2, xBase[1] - d3, xBase[2]];
      xLeg[5] = [xBase[0] + d2, xBase[1] - d3, xBase[2]];      
    }

    var bits = [];
    for (var i = 0; i < 6; i++)
      bits = bits.concat(this.moveLeg(i, xBase, xLeg[i], u[i], angles));
    
    Servo.sendToArduino(bits);
    console.log(bits);

  },

  moveLeg: function (i, xBase, xLeg, u, angles) {

    // Input treatment
    xBase = xBase || math.zeros(3);
    xLeg = xLeg || math.zeros(3);
    u = u || [50, 130, -80];
    angles = angles || math.zeros(3);
    //console.log([i, xBase, xLeg, u, angles]);

    // Rotation matrix
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

    // Hip joint angle calculation
    var s1 = math.subtract(xLeg, xBase);
    var l = math.subtract(math.add(xBase, math.multiply(R, s1)), u);
    var alpha = Math.atan(math.dot(l, math.multiply(R, [0, 1, 0]))/math.dot(l, math.multiply(R, [1, 0, 0])));

    // Knee joint vector calculation
    var s2 = math.matrix([
      s1[0] + ((-1)^(i+1))*L[0]*Math.cos(alpha),
      s1[1] + ((-1)^(i+1))*L[0]*Math.sin(alpha),
      s1[2]
    ]);

    // Knee leg vector calculation
    var l1 = math.add(xBase, math.multiply(R, s2)); 
    
    // Intermediate angles
    var rho = Math.atan(math.subset(l1, math.index(2))/math.sqrt(l1[0]^2 + math.subset(l1, math.index(1))^2));
    var phi = Math.asin((math.subset(l1, math.index(2)) - math.subset(l, math.index(2)))/L[0]);

    // Solutions
    var beta = Math.acos((L[1]^2 + math.norm(l1)^2 - L[2]^2)/(2*L[1]*math.norm(l1))) - (rho + phi);
    var gamma = math.pi - Math.acos(((L[1]^2) + (L[2]^2 - math.norm(l1)^2))/(2*L[1]*L[2]));

    return this.radiansToBits([alpha, beta, gamma]); // rho, phi

  },

  radiansToBits: function(radians) {

    if (Array.isArray(radians)) {
      var bits = [];
      for (var i = 0; i < radians.length; i++)
        bits[i] = this.radiansToBits(radians[i]);
      return bits;
    }
    else if (isNaN(radians))
      return 512;

    radians = radians < 0 ? 360 - radians : radians;
    var bits = math.round(radians*3072/(5*math.pi));
    return bits > 1023 ? 1023 : bits;

  }
  
};

var Main = {

  init: function(b) {
    board = b;
    console.log('Hexapod initialized');
  }

}


/* ==============
   ASSOCIATIONS
============== */
exports.init = function(board) { 
  Main.init(board);
  return exports; 
}
exports.Servo = Servo;
exports.Base = Base;
exports.IK = IK;
