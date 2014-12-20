// Libraries
const math  = require("mathjs");

// Main
var IK = {

 
  // planLegParabola: function(i, u_i, u_f, x_0, rot, rot2, n_intervals) {
  //   var d1 = 43.7865, 
  //       d2 = 91.82, 
  //       d = d1 + d2,
  //       d3 = 131.82;

  //   // Leg coordinates in base frame
  //   var x_P = math.matrix(
  //     [- d2,   d3, 0], //x_P1
  //     [  d2,   d3, 0], //x_P2
  //     [- d,    0,  0], //x_P3
  //     [  d,    0,  0], //x_P4
  //     [- d2, - d3, 0], //x_P5
  //     [  d2; - d3; 0], //x_P6

  //   );




  // }


 // move all legs, based on body base
  move: function(xBase, xLeg, u, angles) {

    var d1 = 43.7865, 
        d2 = 91.82, 
        d = d1 + d2,
        d3 = 131.82;

    if (!u) {
      var u = [];
      u[0] = [-d2 - 150, d3 + 150, -80];
      u[1] = [d2 + 150, d3 + 150, -80];
      u[2] = [-d - 150, 0, - 80];
      u[3] = [d + 150, 0, - 80];
      u[4] = [-d2 - 150, -d3 - 150, -80];
      u[5] = [d2 + 150, -d3 - 150, -80];
    }

    var xBase = xBase || [0, 0, 0];
    var angles = angles || [0, 0, 0];

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

    try {
      for (var i = 0; i < 6; i++)
        bits = bits.concat(this.getLegAngles(i, xBase, xLeg[i], u[i], angles));
    }
    catch (err) {
      hex.Info.log(["IKError", err.message]);
      return false;
    }
    
    hex.Servo.moveAll(bits);
    hex.Info.base.rotation = angles;
    hex.Info.base.position = xBase;
    //console.log(bits);

  },

  // return [alpha, beta, gamma], from 0 to 1023
  getLegAngles: function (i, xBase, xLeg, u, angles) {
    var d1 = 43.7865, 
        d2 = 91.82, 
        d = d1 + d2,
        d3 = 131.82;
    // Input treatment
    xBase = xBase || math.zeros(3);
    xLeg = xLeg || [  -d,   0, 0];
    u = u || [  -d - 150,  0  , -80];
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

    //Alpha is now verified in bits, at the end of the function
    //if (Math.abs(alpha) > c.ALPHA_LIMIT)
      //throw new Error("Limits exceeded (alpha = " + alpha + ")");

    // Knee joint vector calculation
    var s2 = math.matrix([
      math.subset(s1, math.index(0)) + (Math.pow(-1, i+1))*c.L[0]*Math.cos(alpha),
      math.subset(s1, math.index(1)) + (Math.pow(-1, i+1))*c.L[0]*Math.sin(alpha),
      math.subset(s1, math.index(2))
    ]);

    //console.log(alpha);
    //console.log(s2);
   
    // Knee leg vector calculation
    var l1 = math.subtract(math.add(xBase, math.multiply(R, s2)),u); 
    
    // Intermediate angles
    var rho = Math.pow(math.subset(l1, math.index(0)),2) + Math.pow(math.subset(l1, math.index(1)),2);
    rho = Math.sqrt(rho);
    rho = Math.atan(math.subset(l1, math.index(2))/rho);

    // Verificar phi se der errado com rotação da base
    var phi = Math.asin((math.subset(l1, math.index(2)) - math.subset(l, math.index(2)))/c.L[0]);
    
    var beta = Math.pow(c.L[1],2) + Math.pow(math.norm(l1),2) - Math.pow(c.L[2],2);
    beta = beta/(2*c.L[1]*math.norm(l1));

    if (Math.abs(beta) > 1)
      throw new Error("Unreachable position (beta = " + beta + ")");

    beta = Math.acos(beta) - rho - phi;

    if (beta > c.BETA_UPPER_LIMIT || beta < c.BETA_LOWER_LIMIT)
      throw new Error("Limits exceeded (beta = " + beta + ")");

    var gamma = Math.pow(c.L[1],2) + Math.pow(c.L[2],2) - Math.pow(math.norm(l1),2);
    gamma = gamma/(2*c.L[1]*c.L[2]);

    if (Math.abs(gamma) > 1)
      throw new Error("Unreachable position (gamma = " + gamma + ")");

    gamma = Math.acos(gamma);
    gamma = math.pi - gamma;

    if (gamma > c.GAMMA_UPPER_LIMIT || gamma < c.GAMMA_LOWER_LIMIT)
      throw new Error("Limits exceeded (gamma = " + gamma + ")");

    //console.log([alpha, beta, gamma]);
    if (i == 0) {
      alpha = alpha + math.pi/4;
    }
    else if (i == 4) {
      alpha = alpha - math.pi/4;
    }
    else if (i == 1){
      alpha = alpha - math.pi/4;
    }
    else if ( i == 5){
      alpha = alpha + math.pi/4;
    }

    var result = this.radiansToBits([alpha,beta,gamma]);
    //console.log(result);
    //Verify alpha, after conversion to bits
    if(result[0] > c.ALPHA_UPPER_LIMIT_BITS || result[0] < c.ALPHA_LOWER_LIMIT_BITS){
      throw new Error("Limits exceeded (alpha = " + result[0] + ")");
    }
    return result;

  },

  radiansToBits: function(radians, negative) {

    if (Array.isArray(radians)) {
      var bits = [];
      for (var i = 0; i < radians.length; i++)
        bits[i] = this.radiansToBits(radians[i], (i != 0));
      return bits;
    }
    else if (isNaN(radians))
      return 512;


    var bits = math.round((1023/300)*(180/math.pi)*radians*(negative ? -1 : 1) + 512);
    return bits > 1023 ? 1023 : bits;

  },

  eulerRotation: function(a) {

    var t;

    t = a[2];
    var C = math.matrix([
      [Math.cos(t), Math.sin(t), 0], 
      [-Math.sin(t), Math.cos(t), 0], 
      [0, 0, 1]
    ]);

    t = a[1];
    var B = math.matrix([
      [1, 0, 0],
      [0, Math.cos(t), Math.sin(t)],
      [0, -Math.sin(t), Math.cos(t)]
    ]);

    t = a[0];
    var A = math.matrix([
      [Math.cos(a), Math.sin(a), 0],
      [-Math.sin(a), Math.cos(a), 0],
      [0, 0, 1]
    ]);

    return math.multiply(C, math.multiply(B, A));

  }

};


module.exports = IK;