// Libraries
var c = hex.c,
  Servo = hex.Servo,
  Animation = hex.Animation;
var math  = require("mathjs");

// Constants
var delta_h = 35;
//var MAX_SERVO_SPEED = 306; // degrees/s (see constants.js)
MAX_SERVO_SPEED = 800; // Não sei por que, mas fica bom com esse valor!

// State variables
// Fixed frame

// x: centro da base s2
// U: as posições das pontas das patas s2
// r: angulos de rotação s2
var x = [];
var U = [];
var r = [];

var slider_ref = [0,0,0];
var slider_event = false;


// Main
var Motion = {

  testeTorque: function(){
    Motion.init();

    var Uf1 = Motion.getNewLegPositions([4], [[0, 0, 80]], U);
    var Uf2 = Motion.getNewLegPositions([4], [[0, 0, -140]], Uf1);

    // Subir a pata
    Motion.moveTo(x, r, Uf1, 1000, 10);

    // Descer muito
    Motion.moveTo(x, r, Uf2, 5000, 2000);

    var time = 50; //in ms

    var torque = [];
    var torque_test;
    var aux = [];

    var myInterval = setInterval(function() {
        aux = Servo.getFeedback('presentLoad');
        torque.push(aux[13]);
        torque_test = torque[torque.length - 1];
        if(Math.abs(torque_test) > 150) {
          clearInterval(myInterval);
          Animation.get('default').stop();
          console.log(torque)
        }
      }, time);    

    console.log(torque)

    // var t = setTimeout(function() {           
    //   clearInterval(myInterval);
    //   console.log(torque);
    // }, 10000);

    

  },

  resetFrames: function(){
    var xx = math.squeeze(x);
    var delta_U = [xx, xx, xx, xx, xx, xx];
    U = math.subtract(U, delta_U);
    x = [0,0,0];
  },

  getState: function(json){
    if (json) return {x: x, r: r, U: U};
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

  initAuto: function(timeUnit){
    var timeUnit = timeUnit || 1000;
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

    Motion.moveTo(x, r, U, 2*timeUnit, 100);

    u[0] = [-c.X2 - 110, c.Y2 + 110, h];
    u[1] = [c.X2 + 110, c.Y2 + 110, h];
    u[2] = [-c.X1 - 150, 0, h];
    u[3] = [c.X1 + 150, 0, h];
    u[4] = [-c.X2 - 110, -c.Y2 - 110, h];
    u[5] = [c.X2 + 110, -c.Y2 - 110, h];

    U = this.clone(u);

    console.log("abviasivbebeubv")
    console.log(timeUnit)

    Motion.moveTo(x, r, u, 6*timeUnit, 2*timeUnit + 500);
  },

  // group = 0 -> legs: 0, 3, 4
  // group = 1 -> legs: 1, 2, 5
  // legsDisplacement: matrix 3x3 (line i: displacement of a leg)
  // n_points: number of points in one step
  // heights: array of size n_points
  // factors: array of size n_points
  tripodStep: function(group, legsDisplacement, xf, rf, time, startingTime, n_points, heights, factors){
    var movingLegs = [];
    var delta_x = [];
    var delta_U = [];
    var delta_r = [];
    var list_x = []; // position of the center in each point (size = n_points)
    var list_r = []; // rotation in each point (size = n_points)
    var list_U = []; // positions of the legs in each point
    var list_time = [];
    var list_starting_time = [];
    var aux;

    delta_x = math.subtract(xf, x);
    delta_r = math.subtract(rf, r);
    delta_U = legsDisplacement; 

    if(group == 0) movingLegs = [0, 3, 4];
    else movingLegs = [1, 2, 5];

    // default n_points
    if(!n_points) n_points = 5;

    // default factors
    var def_factors = [];
    def_factors[0] = 0;
    def_factors[1] = 0;
    for(var i = 2; i < n_points - 1; i++){
      def_factors[i] = def_factors[i-1] + 1/(n_points-3);
    }
    def_factors[n_points-1] = 1;
    factors =  factors || def_factors;

    // default factors_base
    // var def_factors_base = [];
    // def_factors_base[0] = 0;
    // def_factors_base[1] = 0;
    // for(var i = 2; i < n_points - 1; i++){
    //   def_factors_base[i] = def_factors_base[i-1] + 1/(n_points-3);
    // }
    // def_factors_base[n_points-1] = 1;
    // factors_base =  factors_base || def_factors_base;


    // default heights
    var def_heights = [];
    for(var i = 0; i < n_points; i++){
      if((i == n_points - 1)  || (i == 0)) def_heights[i] = 0;
      else def_heights[i] = delta_h;
    }
    heights = heights || def_heights;

    // calculating list_x, list_r, list_U and list_time
    for(var i = 0; i < n_points; i++){
      // list_x
      list_x[i] = math.multiply( 
                    math.subset(factors, math.index(i)),
                    delta_x
                  );
      list_x[i] = math.add(x, list_x[i]);

      // list_r
      list_r[i] = math.multiply( 
                    math.subset(factors, math.index(i)),
                    delta_r
                  );
      list_r[i] = math.add(r, list_r[i]);

      // list_U 
      list_U[i] = math.multiply(
                    math.subset(factors, math.index(i)),
                    delta_U
                  );

      list_U[i] = math.add(
                  list_U[i],
                  [ [0, 0, math.subset(heights, math.index(i))],
                    [0, 0, math.subset(heights, math.index(i))],
                    [0, 0, math.subset(heights, math.index(i))],
                  ]
              );

      list_U[i] = Motion.getNewLegPositions(movingLegs, list_U[i], U);
    }

    //**************** Calculating the time between points***************
    // 1. var u : vector of delta_U with maximum norm
    var u = math.squeeze(math.subset(delta_U, math.index([0,3], 0)));

    for(var i = 1; i < 3; i++){
      aux = math.squeeze(math.subset(delta_U, math.index([0,3], i)));        
      if (math.norm(aux) > math.norm(u))
        u = Motion.clone(aux); 
    }

    // 2. var delta_heights: Vector with heights variations (REVIEW THIS POINT IF THE FIRST POINT, i = 0,
    //  IS DIFFERENT OF THE INITIAL STATE, i.e, heights[0] != 0 or factors[0] != 0)
    var delta_heights = [];
    delta_heights[0] = 0;
    for(var i = 1; i < n_points; i ++){
      delta_heights[i] = heights[i] - heights[i-1];
    }


    // 3. Array with the total displacement: sqrt((delta_u[i])² + (delta_heights[i])²)
    var d = [];
    var incremental_factors = [];
    incremental_factors[0] = 0;
    for(var i = 1; i < n_points; i++){
      incremental_factors[i] = factors[i] - factors[i-1];
    }

    for(var i = 0; i < n_points; i++){
      d[i] = (math.square(math.subset(incremental_factors, math.index(i))*math.norm(u))) + math.square(delta_heights[i]);
      d[i] = math.sqrt(d[i]);
    }

    // 4. Normalize array d, regarding the total displacement
       d = math.multiply(1/math.sum(d), d);

    // 5. Calculating displacement time to each point
    for(var i = 0; i < n_points; i++){
      list_time[i] = time*math.subset(d, math.index(i));
    }
    //******************************************************************

    // list_starting_time
    list_starting_time[0] = startingTime;
    for(var i = 1; i < n_points; i++){
      list_starting_time[i] = list_starting_time[i-1] + list_time[i-1]; 
    }
    
    /*console.log("****************")
    console.log(list_time)
    console.log(list_starting_time)
    //console.log(list_starting_time)
    console.log("****************")*/

    // Moving 
    for(var i = 0; i < n_points; i++){
      Motion.moveTo(list_x[i], 
                    list_r[i], 
                    list_U[i], 
                    list_time[i], 
                    list_starting_time[i]);
    }
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
  moveTo: function(xf, rf, Uf, time, startingTime, isRelative_x, isRelative_r, isRelative_U, isSlider){
    //rf = Motion.degreesToRadians(rf);

    try {
      
      xf = xf || Motion.clone(x);
      rf = rf || Motion.clone(r);
      Uf = Uf || Motion.clone(U);

      // Slider ********************
      if(isSlider){
        if(isSlider != slider_event)
          slider_ref = x;

        xf = math.add(slider_ref, xf);
        slider_event = true;
      }
      else slider_event = false;
      //*****************************

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
      for(var i = 0; i < 18; i++)
        servoSpeeds[i] = Motion.speedCalculation(angles_i[i], angles_f[i], time);

      // Moving
      var data = {
        points: [startingTime],
          keyframes: [ 
              {pos: angles_f, speed: servoSpeeds}
          ]
      };

      //Animation.stop();
      Animation.create('default', true).play(data);

      // Updating states
      x = this.clone(xf);
      r = this.clone(rf);
      U = this.clone(Uf);

    }
    catch (error) {
      console.log('Error in moveTo(). Moving to initial position...')
      console.log(error);
      Motion.init();
    }

  },

  speedCalculation: function(start, end, duration) {
    // duration: ms
    // 0.3 = 300/1023
    if(duration == 0) return 800;
    return Math.round((math.abs(start - end)/(duration/1000))*(0.3*1023/MAX_SERVO_SPEED*1));
  },

  // xf: final center position
  // rf: final roation angles
  // Uf: final contact points (matrix 6x3)
  // time: movement time in ms




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
    if(!result || result[0] > c.ALPHA_UPPER_LIMIT_BITS || result[0] < c.ALPHA_LOWER_LIMIT_BITS){
      throw new Error("Limits exceeded (alpha = " + result[0] + ")");
    }
    return result;
  },

  radiansToBits: function(radians, negative) {

    if (Array.isArray(radians)) {
      var bits = [];
      for (var i = 0; i < radians.length; i++) {
        if (isNaN(radians[i]))
          return false;
        bits[i] = this.radiansToBits(radians[i], (i != 0));
      }
      return bits;
    }
    else if (isNaN(radians)) {
      console.log(['problem with radians', radians]);
      return 512;
    }

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