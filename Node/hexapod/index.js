// global.c = require('./hexapod/constants.js');
// global.hex = {
//     Servo: require('./hexapod/servo.js'),
//     Motion: require('./hexapod/motion.js'),
//     Base: require('./hexapod/base.js'),
//     Action: require('./hexapod/action.js')
// };

var utils = require('./utils')

module.exports = {
	c: require('./constants'), 				
	Servo: require('./servo'), 		
	Action: require('./action'),					
	Motion: require('./motion'),			
	Base: require('./base'),				
	//Animation: require('./animation'),	
}
