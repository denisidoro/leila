// Libraries
const math  = require("mathjs");


// Main
var IK = {

  // move all legs, based on body base
  move: function(xBase, xLeg, u, angles) {

    var d1 = 43.7865, 
        d2 = 91.82, 
        d = d1 + d2,
        d3 = 131.82;

    if (!u) {
      var u = [];
      u[0] = [-d2 - 50, d3 + 130, -80];
      u[1] = [d2 + 50, d3 + 130, -80];
      u[2] = [-d - 50, 0, - 80];
      u[3] = [d + 50, 0, - 80];
      u[4] = [-d2 - 50, -d3 - 130, -80];
      u[5] = [d2 + 50, -d3 - 130, -80];
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
      bits = bits.concat(this.getLegAngles(i, xBase, xLeg[i], u[i], angles));
    
    hex.Servo.moveAll(bits);
    hex.Info.base.rotation = angles;
    hex.Info.base.position = xBase;
    //console.log(bits);

  },

  // return [alpha, beta, gamma], from 0 to 1023
  getLegAngles: function (i, xBase, xLeg, u, angles) {

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
      s1[0] + (Math.pow(-1, i+1))*c.L[0]*Math.cos(alpha),
      s1[1] + (Math.pow(-1, i+1))*c.L[0]*Math.sin(alpha),
      s1[2]
    ]);
   
    // Knee leg vector calculation
    var l1 = math.subtract(math.add(xBase, math.multiply(R, s2)),u); 
    
    // Intermediate angles
    var rho = Math.pow(math.subset(l1, math.index(0)),2) + Math.pow(math.subset(l1, math.index(1)),2);
    rho = Math.sqrt(rho);
    rho = Math.atan(math.subset(l1, math.index(2))/rho);
    //Verificar phi se der errado com rotação da base
    var phi = Math.asin((math.subset(l1, math.index(2)) - math.subset(l, math.index(2)))/c.L[0]);
    
    var beta = Math.pow(c.L[1],2) + Math.pow(math.norm(l1),2) - Math.pow(c.L[2],2);
    beta = beta/(2*c.L[1]*math.norm(l1));
    beta = Math.acos(beta) - rho - phi;

    var gamma = Math.pow(c.L[1],2) + Math.pow(c.L[2],2) - Math.pow(math.norm(l1),2);
    gamma = gamma/(2*c.L[1]*c.L[2]);
    gamma = Math.acos(gamma);
    gamma = math.pi - gamma;
    //console.log(gamma);

    //console.log([alpha, beta, gamma]);
    return this.radiansToBits([alpha, beta, gamma]);

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


module.exports = IK;