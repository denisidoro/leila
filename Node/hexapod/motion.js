// Libraries
const math  = require("mathjs");

// Constants
// var STEP_TIME = 1000;
var EPSILON = 100; //in ms
var time_frac = 6; // time_move/time_rise
var delta_h = 20;
var defaultVerticalSpeed = 100;

// State variables
var x = [];
var U = [];
var r = [];

// Main
var Motion = {

  initHexapod: function(x_i, U_i, r_i){
      var h = 110;
      var u = [];
        u[0] = [-c.X2 - 110, c.Y2 + 110, 0];
        u[1] = [c.X2 + 110, c.Y2 + 110, 0];
        u[2] = [-c.X1 - 150, 0, 0];
        u[3] = [c.X1 + 150, 0, 0];
        u[4] = [-c.X2 - 110, -c.Y2 - 110, 0];
        u[5] = [c.X2 + 110, -c.Y2 - 110, 0];
      // Writing states
      U = U_i || u;
      x = x_i || [0, 0, h];
      r = r_i || [0,0,0];
  },

  moveToInit: function(){
      // Moving
      hex.Servo.moveAll(this.getStateAngles(r, x, U), 80);
  },

  // xf: final center position
  // rf: final roation angles
  // Uf: final contact points (matrix 6x3)
  // time: movement time in ms
  changeState: function(xf, rf, Uf, time, starting_time, step){

    var Uf = Uf || this.clone(U);
    
    var movingLegs = [];
    var interm_Uf = [];
    var interm_Ui = [];
    var angles_i = [];
    var angles_interm_i = [];
    var angles_interm_f = [];
    var angles_f = [];
    var servo_speeds_rise = [];
    var servo_speeds = [];
    var servo_speeds_descent = [];
    var aux = [];

    // Adapting time
    time = time*time_frac/(time_frac+2);

    for(var i = 0; i < 6; i++){
      aux = math.subtract(
              math.subset(Uf, math.index(i, [0,3])),
              math.subset(U, math.index(i, [0,3]))
              );
      aux = math.squeeze(aux);
      //aux = [math.subset(aux, math.index(0)), 
      //       math.subset(aux, math.index(1)), 
      //       math.subset(aux, math.index(2))];
      if(aux[0] != 0 || aux[1] != 0 || aux[2] != 0)
        movingLegs.push(i);
    }

    // Calculate interm_Ui and interm_Uf
    for(var i = 0; i < movingLegs.length; i++){
      // interm_Ui
      aux = math.subset(U, math.index(movingLegs[i], [0,3]));
      aux = math.squeeze(aux);
      aux = math.add(aux, [0,0, delta_h]);
      // aux = [math.subset(aux, math.index(0)), 
      //        math.subset(aux, math.index(1)), 
      //        math.subset(aux, math.index(2))];
      aux = math.squeeze(aux);
      interm_Ui[movingLegs[i]] = aux;

      // interm_Uf
      aux = math.subset(Uf, math.index(movingLegs[i], [0,3]));
      aux = math.squeeze(aux);
      aux = math.add(aux, [0,0, delta_h]);
      // aux = [math.subset(aux, math.index(0)), 
      //        math.subset(aux, math.index(1)), 
      //        math.subset(aux, math.index(2))];
      aux = math.squeeze(aux);
      interm_Uf[movingLegs[i]] = aux;
    }

    for(var i = 0; i < 6; i++){
      // i not in movingLegs
      if(movingLegs.indexOf(i) == -1){
        aux = math.subset(U, math.index(i, [0,3]));
        aux = math.squeeze(aux);
        // aux = [math.subset(aux, math.index(0)), 
        //        math.subset(aux, math.index(1)), 
        //        math.subset(aux, math.index(2))];
        interm_Ui[i] = aux;

        aux = math.subset(Uf, math.index(i, [0,3]));
        aux = math.squeeze(aux);
        // aux = [math.subset(aux, math.index(0)), 
        //        math.subset(aux, math.index(1)), 
        //        math.subset(aux, math.index(2))];
        interm_Uf[i] = aux;
      }
    }
 
    // Getting angles
    angles_i = this.getStateAngles(r, x, U);
    if(!angles_i) throw new Error("Angles error 1 in changeState");

    // console.log("*******************************");
    // console.log([r, x, U])
    // console.log("--------------------------------")
    // console.log([rf, xf, Uf])
    // console.log("********************************")

    angles_interm_i = this.getStateAngles(r, x, interm_Ui);
    if(!angles_interm_i) throw new Error("Angles error 1 in changeState");

    angles_interm_f = this.getStateAngles(rf, xf, interm_Uf);
    if(!angles_interm_f) throw new Error("Angles error 1 in changeState");

    angles_f = this.getStateAngles(rf, xf, Uf);
    if(!angles_f) throw new Error("Angles error 1 in changeState");

    // Calculating servo speeds
    for(var i = 0; i < 18; i++){
      //servo_speeds_rise[i] = defaultVerticalSpeed; //in "speed bits"
      //servo_speeds_descent[i] = defaultVerticalSpeed; //in "speed bits"
      // Consider rise and descent times for better precision

      servo_speeds_rise[i] = math.abs(angles_interm_i[i] - angles_i[i])/(0.001*time/time_frac);
      servo_speeds_rise[i] *= (0.3*1023/258);
      servo_speeds_rise[i] = Math.round(servo_speeds_rise[i]) ;

      servo_speeds[i] = math.abs(angles_interm_f[i] - angles_interm_i[i])/(0.001*time); //in "angle bits"/s 
      servo_speeds[i] *= 0.3; //in degrees/s
      servo_speeds[i] *= (1023/306); //in "speed bits"
      servo_speeds[i] = Math.round(servo_speeds[i]);

      servo_speeds_descent[i] = math.abs(angles_interm_f[i] - angles_f[i])/(0.001*time/time_frac);
      servo_speeds_descent[i] *= (0.3*1023/306);
      servo_speeds_descent[i] = Math.round(servo_speeds_descent[i]) ;

      if (servo_speeds[i] > 1023 || servo_speeds_rise[i] > 1023 || servo_speeds_descent[i] > 1023){
        //throw new Error("Speed error");
      }
    }

    var data = [
      {time: starting_time , pos: angles_interm_i, speed: servo_speeds_rise},
      {time: starting_time + time/time_frac, pos: angles_interm_f, speed: servo_speeds},
      {time: starting_time + time + time/time_frac, pos: angles_f, speed: servo_speeds_descent}
    ];
    //console.table(data);
    x = this.clone(xf);
    r = this.clone(rf);
    U = this.clone(Uf);
    hex.Action.timedMove(data, step > 0);
    //console.log(servo_speeds);
  },

  tripodSimpleWalk: function(step_size, n_steps, direction, step_time, starting_time){
    direction = Motion.degreesToRadians(direction);
    var step = [step_size*Math.sin(direction), step_size*Math.cos(direction), 0];
    var delta_u;
    var delta_x = [0, 0, 0];
    var group; 
    var aux = [];
    var Uf = [];
    var xx; // x before change state
    //Initial position
    //this.initHexapod();

    for(var i = 0; i < n_steps; i++){
      //delta_u movimento da pata que esta no alto
      //delta_x movimento do centro da base
      if(i == 0){
        delta_u = math.multiply(0.5, step);
        delta_x = math.multiply(0.25, step);
      //delta_u = [0, step/2, 0];  //OMAR
       // delta_x = delta_u; //OMAR
        // delta_x = [0, step/6, 0];
        // delta_u = [0, step/3, 0]
      }
      else if (i == n_steps - 1){
        delta_u = math.multiply(0.5, step);
        delta_x = math.multiply(0.25, step);
        //delta_u = [0, step/2, 0]; //OMAR
        //delta_x = [0, 0, 0]; //OMAR
        // delta_x = [0, step*2/3, 0];
        // delta_u = [0, step/3, 0];
      }
      else {
        delta_u = step;
        delta_x = math.multiply(0.5, step);
        // delta_u = [0, step, 0]; //OMAR
        // delta_x = [0, step/2, 0]; //OMAR
        // delta_x = [0, step/3, 0];
        // delta_u = [0, step, 0];
      }

      group = i % 2;

      xx = math.add(x, delta_x);
      xx = math.squeeze(xx);

      // Move 0, 3, 4
      if(group == 0){
        aux = math.subset(U, math.index(0, [0,3]));
        aux = math.squeeze(aux);
        aux = math.add(aux, delta_u);
        aux = math.squeeze(aux);
        //Uf[0] = [math.subset(aux,math.index(0)), math.subset(aux,math.index(1)),math.subset(aux,math.index(2))];
        Uf[0] = aux;

        aux = math.subset(U, math.index(3, [0,3]));
        aux = math.squeeze(aux);
        aux = math.add(aux, delta_u);
        aux = math.squeeze(aux);
        //Uf[3] = [math.subset(aux,math.index(0)), math.subset(aux,math.index(1)),math.subset(aux,math.index(2))];
        Uf[3] = aux;

        aux = math.subset(U, math.index(4, [0,3]));
        aux = math.squeeze(aux);
        aux = math.add(aux, delta_u);
        aux = math.squeeze(aux);
        //Uf[4] = [math.subset(aux,math.index(0)), math.subset(aux,math.index(1)),math.subset(aux,math.index(2))];
        Uf[4] = aux;

        aux = math.subset(U, math.index(1, [0,3]));
        aux = math.squeeze(aux);
        //Uf[1] = [math.subset(aux,math.index(0)), math.subset(aux,math.index(1)),math.subset(aux,math.index(2))];
        Uf[1] = aux;

        aux = math.subset(U, math.index(2, [0,3]));
        aux = math.squeeze(aux);
        //Uf[2] = [math.subset(aux,math.index(0)), math.subset(aux,math.index(1)),math.subset(aux,math.index(2))];
        Uf[2] = aux;

        aux = math.subset(U, math.index(5, [0,3]));
        aux = math.squeeze(aux);
        //Uf[5] = [math.subset(aux,math.index(0)), math.subset(aux,math.index(1)),math.subset(aux,math.index(2))];
        Uf[5] = aux;
      }

      // Move 1, 2, 5
      else{
        aux = math.subset(U, math.index(1, [0,3]));
        aux = math.squeeze(aux);
        aux = math.add(aux, delta_u);
        aux = math.squeeze(aux);
        //Uf[1] = [math.subset(aux,math.index(0)), math.subset(aux,math.index(1)),math.subset(aux,math.index(2))];
        Uf[1] = aux;

        aux = math.subset(U, math.index(2, [0,3]));
        aux = math.squeeze(aux);
        aux = math.add(aux, delta_u);
        aux = math.squeeze(aux);
        //Uf[2] = [math.subset(aux,math.index(0)), math.subset(aux,math.index(1)),math.subset(aux,math.index(2))];
        Uf[2] = aux;

        aux = math.subset(U, math.index(5, [0,3]));
        aux = math.squeeze(aux);
        aux = math.add(aux, delta_u);
        aux = math.squeeze(aux);
        //Uf[5] = [math.subset(aux,math.index(0)), math.subset(aux,math.index(1)),math.subset(aux,math.index(2))];
        Uf[5] = aux;

        aux = math.subset(U, math.index(0, [0,3]));
        aux = math.squeeze(aux);
        //Uf[0] = [math.subset(aux,math.index(0)), math.subset(aux,math.index(1)),math.subset(aux,math.index(2))];
        Uf[0] = aux;

        aux = math.subset(U, math.index(3, [0,3]));
        aux = math.squeeze(aux);
        //Uf[3] = [math.subset(aux,math.index(0)), math.subset(aux,math.index(1)),math.subset(aux,math.index(2))];
        Uf[3] = aux;

        aux = math.subset(U, math.index(4, [0,3]));
        aux = math.squeeze(aux);
        //Uf[4] = [math.subset(aux,math.index(0)), math.subset(aux,math.index(1)),math.subset(aux,math.index(2))];
        Uf[4] = aux;
      }

    this.changeState(xx, [0,0,0], Uf, step_time, starting_time + i*step_time, i);

    }
  },

  // Angles: relative rotation
  turn: function(angles, direction) {
    var U1 = [];
    var U2 = [];
    var R  = [];
    var aux = [];
    //First step - legs 0, 3 and 4


    aux = math.subset(U, math.index(0, [0,3]));


  },

// move all legs, based on body base
  getStateAngles: function(angles, xBase, u, xLeg) {
    if (!u) {
      var u = [];
      u[0] = [-c.X2 - 110, c.Y2 + 110, -120];
      u[1] = [c.X2 + 110, c.Y2 + 110, -120];
      u[2] = [-c.X1 - 150, 0, - 120];
      u[3] = [c.X1 + 150, 0, - 120];
      u[4] = [-c.X2 - 110, -c.Y2 - 110, -120];
      u[5] = [c.X2 + 110, -c.Y2 - 110, -120];
    }

    var xBase = xBase || [0, 0, 0];
    var angles = angles || [0, 0, 0];

    if (!xLeg) {
      var xLeg = [];
      xLeg[0] = [xBase[0] - c.X2, xBase[1] + c.Y2, xBase[2]];
      xLeg[1] = [xBase[0] + c.X2, xBase[1] + c.Y2, xBase[2]];
      xLeg[2] = [xBase[0] - c.X1, xBase[1], xBase[2]];
      xLeg[3] = [xBase[0] + c.X1, xBase[1], xBase[2]];
      xLeg[4] = [xBase[0] - c.X2, xBase[1] - c.Y2, xBase[2]];
      xLeg[5] = [xBase[0] + c.X2, xBase[1] - c.Y2, xBase[2]];      
    }

    var bits = [];

    try {
      for (var i = 0; i < 6; i++)
        bits = bits.concat(this.getLegAngles(i, xBase, xLeg[i], u[i], angles));
    }
    catch (err) {
      console.table(["MotionError", err.message]);
      return false;
    }
    //console.log(bits);

    //hex.Servo.moveAll(bits, speed);
    //hex.Base.rotation = angles;
    //hex.Base.position = xBase;
    //console.log(bits);
    return bits;
  },

  // return [alpha, beta, gamma], from 0 to 1023
  getLegAngles: function (i, xBase, xLeg, u, angles) {

    // Input treatment
    xBase = xBase || math.zeros(3);
    xLeg = xLeg || [  -c.X1,   0, 0];
    u = u || [  -c.X1 - 150,  0  , -80];
    angles = angles || math.zeros(3);
    var L = [c.COXA_LENGTH, c.FEMUR_LENGTH, c.TIBIA_LENGTH];
    //console.log([i, xBase, xLeg, u, angles]);

    //Rotation matrix
    // var t;
    // t = math.subset(angles, math.index(2));
    // var C = math.matrix([
    //   [Math.cos(t), Math.sin(t), 0], 
    //   [-Math.sin(t), Math.cos(t), 0], 
    //   [0, 0, 1]
    // ]);
    // t = math.subset(angles, math.index(1));
    // var B = math.matrix([
    //   [1, 0, 0], 
    //   [0, Math.cos(t), Math.sin(t)], 
    //   [0, -Math.sin(t), Math.cos(t)]
    // ]);
    // t = math.subset(angles, math.index(0));
    // var A = math.matrix([
    //   [Math.cos(t), Math.sin(t), 0], 
    //   [-Math.sin(t), Math.cos(t), 0], 
    //   [0, 0, 1]
    // ]);
    // var R = math.multiply(C, math.multiply(B, A));

    var R = this.rotationXYZ(angles);
    R = math.matrix(R);

    // Hip joint angle calculation
    var s1 = math.subtract(xLeg, xBase);
    var l = math.subtract(math.add(xBase, math.multiply(R, s1)), u);
    var alpha = Math.atan(math.dot(l, math.multiply(R, [0, 1, 0]))/math.dot(l, math.multiply(R, [1, 0, 0])));

    //Alpha is now verified in bits, at the end of the function
    //if (Math.abs(alpha) > c.ALPHA_LIMIT)
      //throw new Error("Limits exceeded (alpha = " + alpha + ")");

    // Knee joint vector calculation
    var s2 = math.matrix([
      math.subset(s1, math.index(0)) + (Math.pow(-1, i+1))*L[0]*Math.cos(alpha),
      math.subset(s1, math.index(1)) + (Math.pow(-1, i+1))*L[0]*Math.sin(alpha),
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
    var phi = Math.asin((math.subset(l1, math.index(2)) - math.subset(l, math.index(2)))/L[0]);
    
    var beta = Math.pow(L[1],2) + Math.pow(math.norm(l1),2) - Math.pow(L[2],2);
    beta = beta/(2*L[1]*math.norm(l1));

    if (Math.abs(beta) > 1)
      throw new Error("Unreachable position (acos argument - beta = " + beta + ")");

    beta = Math.acos(beta) - rho - phi;

    if (beta > c.BETA_UPPER_LIMIT || beta < c.BETA_LOWER_LIMIT)
      throw new Error("Limits exceeded (beta = " + beta + ")");

    var gamma = Math.pow(L[1],2) + Math.pow(L[2],2) - Math.pow(math.norm(l1),2);
    gamma = gamma/(2*L[1]*L[2]);

    if (Math.abs(gamma) > 1)
      throw new Error("Unreachable position (acos argument - gamma = " + gamma + ")");

    gamma = Math.acos(gamma);
    gamma = math.pi - gamma;

    if (gamma > c.GAMMA_UPPER_LIMIT || gamma < c.GAMMA_LOWER_LIMIT)
      throw new Error("Limits exceeded (gamma = " + gamma + ")");

    //console.log([alpha, beta, gamma]);
    //return [alpha, beta, gamma]
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

  rotationXYZ: function(a) {

    var t;

    t = math.subset(a, math.index(0));
    var Rx = math.matrix([
      [1, 0, 0],
      [0, Math.cos(t), -Math.sin(t)],
      [0, Math.sin(t), Math.cos(t)]
      ]);

    t = math.subset(a, math.index(1));
    var Ry = math.matrix([
      [Math.cos(t), 0, Math.sin(t)],
      [0, 1, 0],
      [-Math.sin(t), 0, Math.cos(t)]
      ]);

    t = math.subset(a, math.index(2));
    var Rz = math.matrix([
      [Math.cos(t), -Math.sin(t), 0],
      [Math.sin(t), Math.cos(t), 0],
      [0, 0, 1]
      ]);

    return math.multiply(Rx, math.multiply(Ry, Rz));
  },

  degreesToRadians: function(degrees){
    if (Array.isArray(degrees)) {
      var r = [];
      for (var i = 0; i < degrees.length; i++)
        r.push(Motion.degreesToRadians(degrees[i]));
      return r;
    }
    return degrees*math.pi/180;
  },

  clone: function(a){
    return JSON.parse(JSON.stringify(a));
  }

};

module.exports = Motion;