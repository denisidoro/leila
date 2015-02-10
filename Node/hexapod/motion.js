// Libraries
var utils = require('./utils'),
  c = utils.require('constants'),
  Servo = utils.require('servo'),
  Animation = utils.require('animation');
var math  = require("mathjs");

// Constants
//var STEP_TIME = 1000;
var EPSILON = 10; // Tempo de antecedência (ms)
var time_frac = 6; // time_move/time_rise
var DIV = 6; //see tripodStep()
var delta_h = 25;
//var MAX_SERVO_SPEED = 306; // degrees/s (see constants.js)
var defaultVerticalSpeed = 100;

// State variables
var x = [];
var U = [];
var r = [];

// Main
var Motion = {

  resetFrames: function(){
    var xx = math.squeeze(x);
    var delta_U = [xx, xx, xx, xx, xx, xx];
    U = math.subtract(U, delta_U);
    x = [0,0,0];
  },

  getState: function(){
    return [x, U, r];
  },

  init: function(x_i, U_i, r_i){
      var h = 110;
      var u = [];
        u[0] = [-c.X2 - 110, c.Y2 + 110, -h];
        u[1] = [c.X2 + 110, c.Y2 + 110, -h];
        u[2] = [-c.X1 - 150, 0, -h];
        u[3] = [c.X1 + 150, 0, -h];
        u[4] = [-c.X2 - 110, -c.Y2 - 110, -h];
        u[5] = [c.X2 + 110, -c.Y2 - 110, -h];
      // Writing states
      U = U_i || u;
      x = x_i || [0, 0, 0];
      r = r_i || [0,0,0];
      Motion.moveToInit();
  },

  moveToInit: function(){
      // Moving
      Servo.moveAll(this.getStateAngles(r, x, U), 80);
  },

  initAuto: function(){
    var h1 = 20;
    var h = -110;
    x = [0,0,0];
    r = [0,0,0];
    var u = [];
      u[0] = [-c.X2 - 110, c.Y2 + 110, h1];
      u[1] = [c.X2 + 110, c.Y2 + 110, h1];
      u[2] = [-c.X1 - 150, 0, h1];
      u[3] = [c.X1 + 150, 0, h1];
      u[4] = [-c.X2 - 110, -c.Y2 - 110, h1];
      u[5] = [c.X2 + 110, -c.Y2 - 110, h1];

    U = this.clone(u);

    Motion.moveTo(x, r, U, 2000, 100);

    u[0] = [-c.X2 - 110, c.Y2 + 110, h];
    u[1] = [c.X2 + 110, c.Y2 + 110, h];
    u[2] = [-c.X1 - 150, 0, h];
    u[3] = [c.X1 + 150, 0, h];
    u[4] = [-c.X2 - 110, -c.Y2 - 110, h];
    u[5] = [c.X2 + 110, -c.Y2 - 110, h];

    U = this.clone(u);

    Motion.moveTo(x, r, u, 5000, 2500);
  },

  //step_size: in mm
  //direction: in degrees
  //step_time: in ms
  //starting_time in ms
  //isRelativeDirection: true or false
  tripodPlaneWalk: function(step_size, n_steps, direction, stepTime, startingTime, changeOrientation){
    direction = Motion.degreesToRadians(direction);
    var movingLegs = [];
    var group;
    var legsDisplacement;
    var xf;
    var rf;
    var ui = [];
    var uf = [];
    var aux = [];
    var step = [step_size*Math.sin(direction), step_size*Math.cos(direction), 0];

    for(var i = 0; i < n_steps; i++){

      if(i == 0){
        delta_u = math.multiply(0.5, step);
        delta_x = math.multiply(0.25, step);
      }
      else if (i == n_steps - 1){
        delta_u = math.multiply(0.5, step);
        delta_x = math.multiply(0.25, step);
      }
      else {
        delta_u = step;
        delta_x = math.multiply(0.5, step);
      }

      group = i % 2;
      if(group == 0) movingLegs = [0, 3, 4];
      else movingLegs = [1, 2, 5];

     // Getting initial positions of moving legs
      for(var j = 0; j < 3; j++){
        aux = math.subset(U, math.index(movingLegs[j], [0,3]));
        aux = math.squeeze(aux);
        ui[j] = aux;
      }

      // Calculating final positions of moving legs
      xf = math.add(x, delta_x);
      r = math.squeeze(r);

      rf = Motion.clone(r);
      R = [[1,0,0], [0,1,0], [0,0,1]];
        if(changeOrientation) {
          rf = [math.subset(r, math.index(0)), math.subset(r, math.index(0)), direction];
          R = Motion.rotationXYZ(rf);
        }
      

      for(var j = 0; j < 3; j++){
        uf[j] = math.add(ui[j], delta_u);
        uf[j] = math.subtract(uf[j], xf);
        uf[j] = math.transpose(uf[j]);
        uf[j] = math.multiply(R, uf[j]);
        uf[j] = math.squeeze(uf[j]);
        uf[j] = math.add(uf[j], xf);
        uf[j] = math.subtract(uf[j], ui[j]); // delta_u instead of uf, tripodStep() takes the variation
        uf[j] = math.squeeze(uf[j]);
      }
      Motion.tripodStep(group, uf, xf, rf, stepTime, startingTime + i*stepTime);
    }
  },

  // group = 0 -> legs: 0, 3, 4
  // group = 1 -> legs: 1, 2, 5
  // legsDisplacement: matrix 3x3 (line i: displacement of a leg)
  tripodStep: function(group, legsDisplacement, xf, rf, time, startingTime){
    var movingLegs = [];
    var displacement = [];
    var xm = [];
    var rm = [];
    var U1 = [];
    var U2 = [];
    var U3 = [];
    var Uf = []; 

    if(group == 0) movingLegs = [0, 3, 4];
    else movingLegs = [1, 2, 5];

    Uf = Motion.getNewLegPositions(movingLegs, legsDisplacement);

    U1 = Motion.getNewLegPositions(movingLegs, [[0, 0, delta_h], [0, 0, delta_h], [0, 0, delta_h]], U);

    U3 = Motion.getNewLegPositions(movingLegs, [[0, 0, delta_h], [0, 0, delta_h], [0, 0, delta_h]], Uf);

    U2 = math.add(U1, U3);
    U2 = math.multiply(1/2, U2);

    xm = math.add(x, xf);
    xm = math.multiply(1/2, xm);

    rm = math.add(r, rf);
    rm = math.multiply(1/2, rm);

    // Rise moving legs
    Motion.moveTo(x, r, U1, time*(1/DIV), startingTime)

    // Move to midpoint
    Motion.moveTo(xm, rm, U2, time*(0.5 - (1/DIV)), startingTime + time*(1/DIV) - EPSILON);

    // Move to end point
    Motion.moveTo(xf, rf, U3, time*(0.5 - (1/DIV)), startingTime + time/2 - EPSILON);
    Motion.moveTo(xf, rf, Uf, time*(1/DIV), startingTime + time*(1 - 1/DIV) - EPSILON); // descend moving legs
  },

  // movingLegs: vector containing the legs that are moving (from 0 to 5)
  // diplacement: matrix (movingLegs.length x 3) containing the displacement of each leg in the vector movingLegs
  // returns Uf, calculated from U and the displacement
  getNewLegPositions: function(movingLegs, displacement, Ui){
    Ui = Ui || Motion.clone(U);
    var delta_U = [];

    for(var i = 0; i < 6; i++){
      // i in movingLegs:
      if(movingLegs.indexOf(i) != -1){
        delta_U[i] = math.squeeze(math.subset(displacement, math.index(movingLegs.indexOf(i), [0,3])));
      } 
      else{
        delta_U[i] = [0,0,0];
      }
    }
    return math.add(Ui, delta_U)
  },

  // New version of changeState()
  // Move to new position
  // xf: final center position
  // rf: final roation angles (in degrees)
  // Uf: final contact points (matrix 6x3)
  // time: movement time in ms
  // if the movement is relative, xf is seen as delta_x
  moveTo: function(xf, rf, Uf, time, startingTime, isRelative_x, isRelative_r, isRelative_U){
    //rf = Motion.degreesToRadians(rf);
    
    xf = xf || Motion.clone(x);
    rf = rf || Motion.clone(r);
    Uf = Uf || Motion.clone(U);

    if(isRelative_x){
      xf = math.add(x, xf);
    }

    if(isRelative_r){
      rf = math.add(r, rf);
    }

    if(isRelative_U){
      Uf = math.add(U, Uf);
    }

    var angles_i;
    var angles_f;
    var servoSpeeds = [];

    // Angles of current state
    angles_i = Motion.getStateAngles(r, x, U);
    if(!angles_i) throw new Error("Initial angles error in moveTo()");

    // Angles of final state
    angles_f = Motion.getStateAngles(rf, xf, Uf);
    if(!angles_f) throw new Error("Initial angles error in moveTo()");

    // Calculating servo speeds
    for(var i = 0; i < 18; i++){
      servoSpeeds[i] = math.abs(angles_f[i] - angles_i[i])/(0.001*time); //in "angle bits"/s
      servoSpeeds[i] *= 0.3; //in degrees/s, 0.3 = 300/1023
      servoSpeeds[i] *= (1023/c.MAX_SERVO_SPEED);  //in "speed bits"
      servoSpeeds[i] = Math.round(servoSpeeds[i]);
    }

    // Moving
    var data = {
      points: [startingTime],
        keyframes: [ 
            {pos: angles_f, speed: servoSpeeds}
        ]
    };

    //Animation.stop();
    Animation.queue(data);
    //hex.Servo.moveAll(angles_f)

    // Updating states
    x = this.clone(xf);
    r = this.clone(rf);
    U = this.clone(Uf);

  },

  // xf: final center position
  // rf: final roation angles
  // Uf: final contact points (matrix 6x3)
  // time: movement time in ms
  changeState: function(xf, rf, Uf, time, starting_time, step) {

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

    var data = {
        points: [starting_time, starting_time + time/time_frac, starting_time + time + time/time_frac],
        keyframes: [ 
            {pos: angles_interm_i, speed: servo_speeds_rise},
            {pos: angles_interm_f, speed: servo_speeds},
            {pos: angles_f, speed: servo_speeds_descent}
        ]
    };

    //console.table(data);
    x = this.clone(xf);
    r = this.clone(rf);
    U = this.clone(Uf);
    
    //Animation.stop();
    //console.table(data);
    Animation.create('main').play(data);

    //console.log(servo_speeds);
    
  },

  tripodSimpleWalk: function(step_size, n_steps, direction, step_time, starting_time){
    var starting_time = starting_time || 0;
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
      }
      else if (i == n_steps - 1){
        delta_u = math.multiply(0.5, step);
        delta_x = math.multiply(0.25, step);
      }
      else {
        delta_u = step;
        delta_x = math.multiply(0.5, step);
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
      else {
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
      console.log(["MotionError", err.message]);
      return false;
    }
    //console.log(bits);

    //hex.Servo.moveAll(bits, speed);
    //hex.Base.rotation = angles;
    //hex.Base.position = xBase;
    //console.log(bits);
    return bits;
  },

  // xBase: coordinates of the center of the base
  // xLeg : olha pra cima
  // u: ponto de contato da pata com o chão em relação ao referencial fixo
  // angles: angulos de rotação
  // return [alpha, beta, gamma], from 0 to 1023
  getLegAngles: function (i, xBase, xLeg, u, angles) {

    // Input treatment
    xBase = xBase || math.zeros(3);
    xLeg = xLeg || [  -c.X1,   0, 0];
    u = u || [  -c.X1 - 150,  0  , -80];
    angles = angles || math.zeros(3);
    var L = [c.COXA_LENGTH, c.FEMUR_LENGTH, c.TIBIA_LENGTH];

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