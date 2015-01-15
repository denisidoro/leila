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

      // Moving
      hex.Servo.moveAll(this.getStateAngles(r, x, U), 80);
  },

  // xf: final center position
  // rf: final roation angles
  // Uf: final contact points (matrix 6x3)
  // time: movement time in ms
  changeState: function(xf, rf, Uf, time, starting_time){
    console.log("HUEHUHEUHEUHU")
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
        throw new Error("Speed error");
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
      hex.Action.timedMove(data);
      console.log(servo_speeds);
  },

  clone: function(a){
    return JSON.parse( JSON.stringify(a) );
  },

  tripodSimpleWalk: function(step_size, n_steps, direction, step_time){
    var step = direction*step_size;
    var delta_u;
    var delta_x = [0, 0, 0];
    var group; 
    var aux = [];
    var Uf = [];
    var xx; // x before change state
    //Initial position
    //this.initHexapod();
    for(var i = 0; i < n_steps; i++){

      if(i == 0){
        delta_u = [0, step/2, 0];
        delta_x = delta_u;
      }
      else if (i == n_steps - 1){
        delta_u = [0, step/2, 0];
        delta_x = [0, 0, 0];
      }
      else {
        delta_u = [0, step, 0];
        delta_x = [0, step/2, 0];
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

    this.changeState(xx, [0,0,0], Uf, step_time, 50 + i*step_time);

    }
  },

  //step_time in us
  straightWalk: function(step_size, n_steps, direction, n_intervals, step_time, h){

    //Direction = {1,-1}
    var step = direction*step_size; 
    var delta_u;
    var delta_x = [0, 0, 0];
    var x = [0, 0, 0]
    var T, t; 
    var A; 
    var group;
    var data = [], cnt = 0;
    var v = []; //Speed of servos (array, size 18)

    //Initial position and constants
    //var h = -100;
    var U = [];
        U[0] = [-c.X2 - 110, c.Y2 + 110, h];
        U[1] = [c.X2 + 110, c.Y2 + 110,  h];
        U[2] = [-c.X1 - 150, 0, h];
        U[3] = [c.X1 + 150, 0, h];
        U[4] = [-c.X2 - 110, -c.Y2 - 110, h];
        U[5] = [c.X2 + 110, -c.Y2 - 110,  h];

    for(var i = 0; i < n_steps; i++){
      if(i == 0){
        delta_u = [0, step/2, 0];
        delta_x = delta_u;
      }
      else if (i == n_steps - 1){
        delta_u = [0, step/2, 0];
        delta_x = [0, 0, 0];
      }
      else {
        delta_u = [0, step, 0];
        delta_x = [0, step/2, 0];
      }

      group = i % 2;
      A = this.straightStep(group, delta_x, x, delta_u, U, [0,0,0], [0,0,0], n_intervals);

      T = A[0];
      x = A[1];
      U = A[2];

      // Data: time, position and speed
      for(var j = 0; j < n_intervals + 1; j++){
        t = math.subset(T, math.index([0,18],j));
        t = math.squeeze(t);
        // Calculating speeds
        for(var m = 0; m < 18; m++){
          if(j == 0){
            v[m] = hex.Servo.defaultSpeed;
          }
          else{
            v[m] = Math.abs(math.subset(T, math.index(m,j)) - math.subset(T, math.index(m, j-1)));
            v[m] = 1.387791*(1 + n_intervals*EPSILON/step_time)*v[m]/(step_time/n_intervals);
            v[m] = 1000000*v[m]; //from (microseconds)^-1 to (seconds)^-1
            v[m] = Math.round(v[m]);
          }
        }
         //console.log([T, t]);
        data.push({time: (j + (n_intervals + 1)*i)*step_time/n_intervals, pos: t._data,
                  speed: v});
        //console.log(v);
      }
    }
    //hex.Action.timedMove(data);
    return data;
  },

  straightStep: function(group, delta_x, x_0, delta_u, Ui, r_i, r_f, n_intervals){
    //  Inputs:
    //  delta_x: displacement of the base (vector)
    //  x_0: initial position of the base
    //  delta_u: displacement of the leg tips
    //  Ui: initial position of the leg tips
    //  r_i : initial rotation of the base
    //  r_f : final rotation of the base 
    //  group: group 0 = legs {1,4,5}, group 1 = legs {2, 3, 6} 
    //  n_intervals = (number of points - 1) of the trajectory

    // Outputs:
    // A : matrix (18 x n_intervals+1) containing the angles of each point
    // x_f : final position of the base 
    // Uf : final position of the leg tips


    // Leg coordinates in base frame (constants)
    var x_P = math.matrix([
      [- c.X2,   c.Y2, 0], //x_P1
      [  c.X2,   c.Y2, 0], //x_P2
      [- c.X1,    0,  0], //x_P3
      [  c.X1,    0,  0], //x_P4
      [- c.X2, - c.Y2, 0], //x_P5
      [  c.X2, - c.Y2, 0], //x_P6
    ]);
    
    //Trajectory of rotation angles and trajectory of the center
    var x_f = math.add(x_0, delta_x); //To be returned
    var r = [];
    var x = [];
    var aux_x = [];
    var aux_r = [];


    for(var i = 0; i <= n_intervals; i++){
      aux_x = math.add(x_0, math.multiply(i/(n_intervals), delta_x));
      aux_r = math.add(r_i, math.multiply(i/(n_intervals), math.subtract(r_f, r_i)));

      x[i] = [math.subset(aux_x, math.index(0)), math.subset(aux_x, math.index(1)),
              math.subset(aux_x, math.index(2))];
      r[i] = [math.subset(aux_r, math.index(0)), math.subset(aux_r, math.index(1)),
              math.subset(aux_r, math.index(2))];
    }

    x = math.matrix(x);
    x = math.transpose(x);
    r = math.matrix(r);
    r = math.transpose(r);

    var A = [];
    var Uf = [];
    var aux = [];
    //*********************************************************************************************************************************
    // Move {0, 3, 4}
    if (group == 0) {
    //console.log(r);
      aux = math.add(math.squeeze(math.subset(Ui, math.index(0, [0,3]))), math.squeeze(delta_u));
      Uf[0] = [math.subset(aux, math.index(0)), math.subset(aux, math.index(1)),
                math.subset(aux, math.index(2))];
 
      aux = math.add(math.squeeze(math.subset(Ui, math.index(3, [0,3]))), math.squeeze(delta_u));
      Uf[3] = [math.subset(aux, math.index(0)), math.subset(aux, math.index(1)),
                math.subset(aux, math.index(2))];

      aux = math.add(math.squeeze(math.subset(Ui, math.index(4, [0,3]))), math.squeeze(delta_u));
      Uf[4] = [math.subset(aux, math.index(0)), math.subset(aux, math.index(1)),
                math.subset(aux, math.index(2))];


      aux = math.squeeze(math.subset(Ui, math.index(1, [0,3])));
      Uf[1] = [math.subset(aux, math.index(0)), math.subset(aux, math.index(1)),
                math.subset(aux, math.index(2))];

      aux = math.squeeze(math.subset(Ui, math.index(2, [0,3])));
      Uf[2] = [math.subset(aux, math.index(0)), math.subset(aux, math.index(1)),
                math.subset(aux, math.index(2))];

      aux = math.squeeze(math.subset(Ui, math.index(5, [0,3])));
      Uf[5] = [math.subset(aux, math.index(0)), math.subset(aux, math.index(1)),
                math.subset(aux, math.index(2))];

      Uf = math.matrix(Uf); //To be returned

      var T0 = this.planLegParabola(0,
                                    math.squeeze(math.subset(Ui, math.index(0, [0,3]))),
                                    math.squeeze(math.subset(Uf, math.index(0, [0,3]))),
                                    x_0,
                                    r_i,
                                    [0, 0, math.subset(r_i, math.index(2))],
                                    n_intervals);

      var T3 = this.planLegParabola(3,
                                    math.squeeze(math.subset(Ui, math.index(3, [0,3]))),
                                    math.squeeze(math.subset(Uf, math.index(3, [0,3]))),
                                    x_0,
                                    r_i,
                                    [0, 0, math.subset(r_i, math.index(2))],
                                    n_intervals);

      var T4 = this.planLegParabola(4,
                                    math.squeeze(math.subset(Ui, math.index(4, [0,3]))),
                                    math.squeeze(math.subset(Uf, math.index(4, [0,3]))),
                                    x_0,
                                    r_i,
                                    [0, 0, math.subset(r_i, math.index(2))],
                                    n_intervals);

      for (var i = 0; i < n_intervals + 1; i++){
        // Moving legs:
        try{
          var angles0 = this.getLegAngles( 
                            0,
                            math.squeeze(math.subset(x, math.index([0,3], i))),
                            math.add(math.squeeze(math.subset(x, math.index([0,3], i))), math.squeeze(math.subset(x_P, math.index(0, [0,3])))),
                            math.squeeze(math.subset(T0, math.index([0,3],i))),
                            math.squeeze(math.subset(r, math.index([0,3], i)))            
                        );

          var angles3 = this.getLegAngles( 
                            3,
                            math.squeeze(math.subset(x, math.index([0,3], i))),
                            math.add(math.squeeze(math.subset(x, math.index([0,3], i))), math.squeeze(math.subset(x_P, math.index(3, [0,3])))),
                            math.squeeze(math.subset(T3, math.index([0,3],i))),
                            math.squeeze(math.subset(r, math.index([0,3], i)))             
                        );

          var angles4 = this.getLegAngles( 
                            4,
                            math.squeeze(math.subset(x, math.index([0,3], i))),
                            math.add(math.squeeze(math.subset(x, math.index([0,3], i))), math.squeeze(math.subset(x_P, math.index(4, [0,3])))),
                            math.squeeze(math.subset(T4, math.index([0,3],i))),
                            math.squeeze(math.subset(r, math.index([0,3], i)))             
                        );


          // Fixed legs:
          var angles1 = this.getLegAngles(
                            1,
                            math.squeeze(math.subset(x, math.index([0,3], i))),
                            math.add(math.squeeze(math.subset(x, math.index([0,3], i))), math.squeeze(math.subset(x_P, math.index(1, [0,3])))),
                            math.squeeze(math.subset(Ui, math.index(1, [0,3]))),
                            math.squeeze(math.subset(r, math.index([0,3], i)))
                        );

          var angles2 = this.getLegAngles(
                            2,
                            math.squeeze(math.subset(x, math.index([0,3], i))),
                            math.add(math.squeeze(math.subset(x, math.index([0,3], i))), math.squeeze(math.subset(x_P, math.index(2, [0,3])))),
                            math.squeeze(math.subset(Ui, math.index(2, [0,3]))),
                            math.squeeze(math.subset(r, math.index([0,3], i)))
                        );

          var angles5 = this.getLegAngles(
                            5,
                            math.squeeze(math.subset(x, math.index([0,3], i))),
                            math.add(math.squeeze(math.subset(x, math.index([0,3], i))), math.squeeze(math.subset(x_P, math.index(5, [0,3])))),
                            math.squeeze(math.subset(Ui, math.index(5, [0,3]))),
                            math.squeeze(math.subset(r, math.index([0,3], i)))
                        );
        }
        catch(err){
          console.log(err);
          throw new Error("straightStep: Error in getLegAngles");
        }   

        A[i] =  [ angles0[0], angles0[1], angles0[2],
                  angles1[0], angles1[1], angles1[2],
                  angles2[0], angles2[1], angles2[2],
                  angles3[0], angles3[1], angles3[2],
                  angles4[0], angles4[1], angles4[2],
                  angles5[0], angles5[1], angles5[2]
                ];
      }
      A = math.matrix(A);
      A = math.transpose(A);
    }
   //*******************************************************************************************************************************************
    // Move {1, 2, 5}
    else if (group == 1) {
    //console.log(r);
      aux = math.add(math.squeeze(math.subset(Ui, math.index(1, [0,3]))), math.squeeze(delta_u));
      Uf[1] = [math.subset(aux, math.index(0)), math.subset(aux, math.index(1)),
                math.subset(aux, math.index(2))];
 
      aux = math.add(math.squeeze(math.subset(Ui, math.index(2, [0,3]))), math.squeeze(delta_u));
      Uf[2] = [math.subset(aux, math.index(0)), math.subset(aux, math.index(1)),
                math.subset(aux, math.index(2))];

      aux = math.add(math.squeeze(math.subset(Ui, math.index(5, [0,3]))), math.squeeze(delta_u));
      Uf[5] = [math.subset(aux, math.index(0)), math.subset(aux, math.index(1)),
                math.subset(aux, math.index(2))];


      aux = math.squeeze(math.subset(Ui, math.index(0, [0,3])));
      Uf[0] = [math.subset(aux, math.index(0)), math.subset(aux, math.index(1)),
                math.subset(aux, math.index(2))];

      aux = math.squeeze(math.subset(Ui, math.index(3, [0,3])));
      Uf[3] = [math.subset(aux, math.index(0)), math.subset(aux, math.index(1)),
                math.subset(aux, math.index(2))];

      aux = math.squeeze(math.subset(Ui, math.index(4, [0,3])));
      Uf[4] = [math.subset(aux, math.index(0)), math.subset(aux, math.index(1)),
                math.subset(aux, math.index(2))];

      Uf = math.matrix(Uf); //To be returned

      var T1 = this.planLegParabola(1,
                                    math.squeeze(math.subset(Ui, math.index(1, [0,3]))),
                                    math.squeeze(math.subset(Uf, math.index(1, [0,3]))),
                                    x_0,
                                    r_i,
                                    [0, 0, math.subset(r_i, math.index(2))],
                                    n_intervals);

      var T2 = this.planLegParabola(2,
                                    math.squeeze(math.subset(Ui, math.index(2, [0,3]))),
                                    math.squeeze(math.subset(Uf, math.index(2, [0,3]))),
                                    x_0,
                                    r_i,
                                    [0, 0, math.subset(r_i, math.index(2))],
                                    n_intervals);

  
      var T5 = this.planLegParabola(5,
                                    math.squeeze(math.subset(Ui, math.index(5, [0,3]))),
                                    math.squeeze(math.subset(Uf, math.index(5, [0,3]))),
                                    x_0,
                                    r_i,
                                    [0, 0, math.subset(r_i, math.index(2))],
                                    n_intervals);

      for (var i = 0; i < n_intervals + 1; i++){
        // Moving legs:
        try{
          var angles1 = this.getLegAngles( 
                            1,
                            math.squeeze(math.subset(x, math.index([0,3], i))),
                            math.add(math.squeeze(math.subset(x, math.index([0,3], i))), math.squeeze(math.subset(x_P, math.index(1, [0,3])))),
                            math.squeeze(math.subset(T1, math.index([0,3],i))),
                            math.squeeze(math.subset(r, math.index([0,3], i)))            
                        );

          var angles2 = this.getLegAngles( 
                            2,
                            math.squeeze(math.subset(x, math.index([0,3], i))),
                            math.add(math.squeeze(math.subset(x, math.index([0,3], i))), math.squeeze(math.subset(x_P, math.index(2, [0,3])))),
                            math.squeeze(math.subset(T2, math.index([0,3],i))),
                            math.squeeze(math.subset(r, math.index([0,3], i)))             
                        );

          var angles5 = this.getLegAngles( 
                            5,
                            math.squeeze(math.subset(x, math.index([0,3], i))),
                            math.add(math.squeeze(math.subset(x, math.index([0,3], i))), math.squeeze(math.subset(x_P, math.index(5, [0,3])))),
                            math.squeeze(math.subset(T5, math.index([0,3],i))),
                            math.squeeze(math.subset(r, math.index([0,3], i)))             
                        );


          // Fixed legs:
          var angles0 = this.getLegAngles(
                            0,
                            math.squeeze(math.subset(x, math.index([0,3], i))),
                            math.add(math.squeeze(math.subset(x, math.index([0,3], i))), math.squeeze(math.subset(x_P, math.index(0, [0,3])))),
                            math.squeeze(math.subset(Ui, math.index(0, [0,3]))),
                            math.squeeze(math.subset(r, math.index([0,3], i)))
                        );

          var angles3 = this.getLegAngles(
                            3,
                            math.squeeze(math.subset(x, math.index([0,3], i))),
                            math.add(math.squeeze(math.subset(x, math.index([0,3], i))), math.squeeze(math.subset(x_P, math.index(3, [0,3])))),
                            math.squeeze(math.subset(Ui, math.index(3, [0,3]))),
                            math.squeeze(math.subset(r, math.index([0,3], i)))
                        );

          var angles4 = this.getLegAngles(
                            4,
                            math.squeeze(math.subset(x, math.index([0,3], i))),
                            math.add(math.squeeze(math.subset(x, math.index([0,3], i))), math.squeeze(math.subset(x_P, math.index(4, [0,3])))),
                            math.squeeze(math.subset(Ui, math.index(4, [0,3]))),
                            math.squeeze(math.subset(r, math.index([0,3], i)))
                        );
        }
        catch(err){
          console.log(err)
          throw new Error("straightStep: Error in getLegAngles");
        }   

        A[i] =  [ angles0[0], angles0[1], angles0[2],
                  angles1[0], angles1[1], angles1[2],
                  angles2[0], angles2[1], angles2[2],
                  angles3[0], angles3[1], angles3[2],
                  angles4[0], angles4[1], angles4[2],
                  angles5[0], angles5[1], angles5[2]
                ];
      }
      A = math.matrix(A);
      A = math.transpose(A);
    }
   //*********************************************************************************************************************************************
    return [A, x_f, Uf];
  },
 
  planLegParabola: function(i, u_i, u_f, x_0, rot, rot2, n_intervals) {
    // u_i, u_f, x_0: matrix size 3 or array


    // Leg coordinates in base frame (constants)
    var x_P = math.matrix([
      [- c.X2,   c.Y2, 0], //x_P1
      [  c.X2,   c.Y2, 0], //x_P2
      [- c.X1,    0,  0], //x_P3
      [  c.X1,    0,  0], //x_P4
      [- c.X2, - c.Y2, 0], //x_P5
      [  c.X2, - c.Y2, 0], //x_P6
    ]);


    // Rotation matrices
    var R = this.rotationXYZ(rot);
    var RR = this.rotationXYZ(rot2);

    // Change of coordinates: fixed frame -> movement frame
    // Verify here in case of a problem concerning rotations
    var s = math.subset(x_P, math.index(i, [0,3]));
    var l = math.subtract(
      math.add(math.multiply(R, math.transpose(s)), x_0), 
      u_i);
    l = math.squeeze(l); //l fica no formato { _data: [ 150, -50, 80 ], _size: [ 3 ] }

    
    var x_pmov = math.add(math.multiply(math.dot(l, math.multiply(RR, [1,0,0])), [1,0,0]), 
                 math.multiply(math.dot(l, math.multiply(RR, [0,1,0])), [0,1,0]));

    var u_i_mov = math.multiply(math.inv(RR),math.subtract(u_i, x_pmov));
    var u_f_mov = math.multiply(math.inv(RR),math.subtract(u_f, x_pmov));

    // Finding x = f(y) and z = g(y)
    var ui = u_i_mov;
    var uf = u_f_mov;

    var p = (math.subset(uf, math.index(1)) - math.subset(ui, math.index(1)))/n_intervals;
    var y = [];

    for(var k = 0; k < n_intervals + 1; k++){
      y[k] = math.subset(ui, math.index(1)) + k*p;
    }

    // x = f(y) = ay² + by + c
    var ym = (math.subset(uf, math.index(1)) + math.subset(ui, math.index(1)))/2;
    var dif = math.abs(math.subset(uf, math.index(1)) - math.subset(ui, math.index(1)));
    //Aux---
    var qq = math.subset(ui, math.index(1));
    var ww = math.subset(uf, math.index(1));
    var ss = ym;
    var kk = math.subset(ui, math.index(0));
    var ll = math.subset(uf, math.index(0));
    var mm = kk + Math.pow(-1,i+1)*dif/4;
    //------
    var K = this.solveParabolaSystem(qq, ww, ss, kk, ll, mm);
    var x = [];
    for(var k = 0; k < n_intervals + 1; k++){
      x[k] = K[0]*Math.pow(y[k], 2) + K[1]*y[k] + K[2]; //K = [a, b, c]
    }

    // z = g(y) = ay² + by + c
    kk = math.subset(ui, math.index(2));
    ll = math.subset(uf, math.index(2));
    mm = kk + dif/2;
    K = this.solveParabolaSystem(qq, ww, ss, kk, ll, mm);
    var z = [];
    for(var k = 0; k < n_intervals + 1; k++){
      z[k] = K[0]*Math.pow(y[k], 2) + K[1]*y[k] + K[2]; //K = [a, b, c]
    }

    TT = math.matrix([x, y, z]);
    T = [];
    // Change of coordinates: movement frame -> fixed frame
    var tt = [];
    for(var k = 0; k < n_intervals + 1; k++){
      tt[0] = math.subset(math.add(math.multiply(RR, 
                math.subset(TT, math.index([0,3], k))), x_pmov), math.index(0,0));
      tt[1] = math.subset(math.add(math.multiply(RR, 
                math.subset(TT, math.index([0,3], k))), x_pmov), math.index(1,0));
      tt[2] = math.subset(math.add(math.multiply(RR, 
                math.subset(TT, math.index([0,3], k))), x_pmov), math.index(2,0));
      T[k] = [tt[0], tt[1], tt[2]];
    }
    T = math.matrix(T);
    T = math.transpose(T);
    return T;
  },


  //Solve system:
  // [q² q 1] [A1]   [k]
  // [w² w 1] [A2] = [l]
  // [s² s 1] [A3]   [m]
  solveParabolaSystem: function(q, w, s, k, l, m){
    var A = math.matrix([
            [Math.pow(q,2), q, 1],
            [Math.pow(w,2), w, 1],
            [Math.pow(s,2), s, 1]
            ]);

    A = math.inv(A);
    var x = math.multiply(A, [k, l, m]);
    x = math.squeeze(x);
    return [math.subset(x, math.index(0)), math.subset(x, math.index(1)), math.subset(x, math.index(2))];
    // Does not work if q² = w²
    // var A2 = (k - l)/(Math.pow(q,2) - Math.pow(w,2));
    // A2 = (l - m)/(Math.pow(w,2) - Math.pow(s,2)) - A2;
    // A2 = A2*(w + s)*(q + w)/(q - s)

    // var A1 = (k - l)/(Math.pow(q,2) - Math.pow(w,2))  - A2/(q + w);

    // var A3 = m - A1*Math.pow(s,2) - A2*s;
    // return [A1, A2, A3];
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
      throw new Error("Unreachable position (acos argument - beta = " + beta + ")");

    beta = Math.acos(beta) - rho - phi;

    if (beta > c.BETA_UPPER_LIMIT || beta < c.BETA_LOWER_LIMIT)
      throw new Error("Limits exceeded (beta = " + beta + ")");

    var gamma = Math.pow(c.L[1],2) + Math.pow(c.L[2],2) - Math.pow(math.norm(l1),2);
    gamma = gamma/(2*c.L[1]*c.L[2]);

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
    return degrees*math.pi/180;
  },

  test: function(){

      var h = -120;
      var Ui = [];
      Ui[0] = [-c.X2 - 120, c.Y2 + 120, h];
      Ui[1] = [c.X2 + 120, c.Y2, h];
      Ui[2] = [-c.X1 - 150, 0, h];
      Ui[3] = [c.X1 + 150, 0, h];
      Ui[4] = [-c.X2 - 120, -c.Y2 - 120, h];
      Ui[5] = [c.X2 + 120, -c.Y2 - 120, h];
      var x_0 = [0,0,0];
      var n_intervals = 15;
      var delta_x = [0,0,0];
      var delta_u = [0,80,0];
      var r_i = [0,0,0];
      var r_f = [0,0,0];
      var A = hex.Motion.straightStep(1, delta_x, x_0, delta_u, Ui, r_i, r_f, n_intervals)
      //console.log(A[0])

      var T = A[0];
      var n = 512;
      console.log(T);
      var ang1;
      var ang2;
      var ang3;
      console.log("oi");
      console.log(math.subset(T, math.index(3, 0)));

      for(var i = 0; i <= n_intervals + 1; i++){
          ang1 = math.subset(T, math.index(3, i));
          ang2 = math.subset(T, math.index(4, i));
          ang3 = math.subset(T, math.index(5, i));
          hex.Servo.moveAll([n, n, n, ang1, ang2, ang3, n, n, n, n, n, n, n, n, n, n, n, n], 20);
          for(var j= 0; j < 10000000; j++){}
      }
      return T;
  }
};

module.exports = Motion;
