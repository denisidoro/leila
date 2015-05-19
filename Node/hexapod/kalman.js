// Libraries
// var Servo = hex.Servo,
//   Motion = hex.Motion,
//   Animation = hex.Animation;
var math  = require("mathjs");

function BtoI(q) {

	var qi = q[0], qj = q[1], qk = q[2], qr = q[3];

	/* todo: add multi-dimensional notation using mathjs
	return [1-2*qj^2-2*qk^2, 2*qi*qj-2*qk*qr, 2*qi*qk+2*qj*qr;
    2*qi*qj+2*qk*qr, 1-2*qi^2-2*qk^2, 2*qj*qk-2*qi*qr; 
    2*qi*qk-2*qj*qr, 2*qj*qk+2*qi*qr, 1-2*qi^2-2*qj^2];
    */

}

// return a skew-symmetric matrix obtained from a vector
function ssm(v) {
	/* todo: add multi-dimensional notation using mathjs
	return [ 0 -v[2] v[1];
      v[2] 0 -v[0];
      -v[1] v[0] 0];
    */

}

var Kalman = {

	init: function() {

	}

};

module.exports = Movement;