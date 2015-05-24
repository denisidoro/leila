// Libraries
// var Servo = hex.Servo,
//   Motion = hex.Motion,
//   Animation = hex.Animation;
var math  = require("mathjs");

function BtoI(q) {

	//var qi = q[0], qj = q[1], qk = q[2], qr = q[3];
	var qi = math.subset(q, math.index(0));
	var qj = math.subset(q, math.index(1));
	var qk = math.subset(q, math.index(2));
	var qr = math.subset(q, math.index(3));

	var aicarlen = [ [1-2*qj*qj-2*qk*qk, 2*qi*qj-2*qk*qr, 2*qi*qk+2*qj*qr],
				 	 [2*qi*qj+2*qk*qr, 1-2*qi*qi-2*qk*qk, 2*qj*qk-2*qi*qr],
				     [2*qi*qk-2*qj*qr, 2*qj*qk+2*qi*qr, 1-2*qi*qi-2*qj*qj]
				    ];

	return math.matrix(aicarlen);

}

// return a skew-symmetric matrix obtained from a vector
function ssm(v) {

    var v0 = math.subset(v, math.index(0));
    var v1 = math.subset(v, math.index(1));
    var v2 = math.subset(v, math.index(2));

    return math.matrix([
    					[0, -v2, v1],
    					[v2, 0, -v0],
    					[-v1, v0, 0],
    	]);
}

function fgamma(n, dt, w){
	var T = math.zeros(3,3);
// 	for i = 0:2
//     T = T + dt^(i+n)*ssm(w)^i/(factorial(i+n));
// end
	for (var i = 0; i<=2; i++){
		T = math.add(
			T,
			math.multiply(math.multiply(math.pow(dt, i + n),math.pow(ssm(w), i)), 1/math.factorial(i+n))
			);
	}
	return T;
}

function app(v){
	var eps = 0.00000001;
	//y = [sin(1/2*norm(v))*v/(norm(v)+eps);
     //cos(1/2*norm(v))];
     var y = math.multiply(Math.sin(0.5*math.norm(v)), v);
     y = math.multiply(y, 1/(norm(v) + eps));
     var y0 = math.subset(y, math.index(0));
     var y1 = math.subset(y, math.index(1));
	 var y2 = math.subset(y, math.index(2));
	 var y3 = Math.cos(0.5*norm(v));

	 return math.matrix([ [y0], [y1], [y2], [y3] ]);
}

function quat_multi(q1, q2){
// % Quaternion multiplication
// % q1 = a*i + b*j + c*k +d
// % q2 = qi*i +qj*j + qk*k +qr
// a = q1(1);
// b = q1(2);
// c = q1(3);
// d = q1(4);

// qi = q2(1);
// qj = q2(2);
// qk = q2(3);
// qr = q2(4);

// p = [a*qr+b*qk-c*qj+d*qi;
//     -a*qk+b*qr+c*qi+d*qj;
//     a*qj-b*qi+c*qr+d*qk;
//     -a*qi-b*qj-c*qk+d*qr];
var a = math.subset(q1, math.index(0));
var b = math.subset(q1, math.index(1));
var c = math.subset(q1, math.index(2));
var d = math.subset(q1, math.index(3));

var qi = math.subset(q1, math.index(0));
var qj = math.subset(q1, math.index(1));
var qk = math.subset(q1, math.index(2));
var qr = math.subset(q1, math.index(3));

var p = [
	 [a*qr+b*qk-c*qj+d*qi],
	 [-a*qk+b*qr+c*qi+d*qj],
	 [a*qj-b*qi+c*qr+d*qk],
	 [ -a*qi-b*qj-c*qk+d*qr]
	];

return math.matrix(p);
}

var rotationXYZ = function(a) {

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
}

var Kalman = {

	init: function() {
		var dt = 0.01;
		var T = 10;
		//t = 0:dt:T;
		var t = [];
		for (var i = 0; i <= T; i++){
			t[i] = i*dt;
		}

		// Rk = Rsk+J*Rak*J';
		var Rsk = math.multiply(0.0005, math.eye(18));
		var Rak = math.multiply(0.005, math.eye(18));
		var J = math.multiply(0.0001, math.ones(18, 18));
		var Rk = math.multiply(Rak, J);
		Rk = math.multiply(J, Rk);
		Rk = math.add(Rsk, Rk);

		var Qf = math.multiply(0.00005, math.eye(3));
		var Qw = math.multiply(0.00005, math.eye(3));
		var Qbf = math.multiply(0.00001, math.eye(3));
		var Qbw = math.multiply(0.00001, math.eye(3));
		var Qp_ground = math.multiply(0.00001,  math.eye(3));
		var Qp_air = math.multiply(100000,  math.eye(3));


		r0 = [0, 0, 0];
		v0 = [0, 0, 0];
		q0 = [0, 0, 0 , 1];
		p10 = [-0.140, -0.0525, -0.110];
		p20 = [-0.140, 0, -0.110];
		p30 = [-0.140, 0.0525, -0.110];
		p40 = [0.140, 0.0525, -0.110];
		p50 = [0.140, 0, -0.110];
		p60 = [0.140, -0.0525, -0.110];
		bf0 = [0, 0, 0];
		bw0 = [0, 0, 0];

		g = [0, 0, -9.81];

		//initial state
		var x_pos = [];
		x_pos[0] = r0.concat(v0, q0, p10, p20, p30, p40, p50, p60, bf0, bw0);

		// just define x_pre as column vector
		var x_pre = [];
		x_pre[0] = math.zeros(34,1);

		// initialize covariance matriz
		var P_pos = math.zeros(33,33);

	}

};

module.exports = Kalman;
