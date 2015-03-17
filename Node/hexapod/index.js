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
	Animation: require('./animation'),					
	Motion: require('./motion'),
	Walk: new (require('./walk')),						
	Movement: require('./movement'),		
	Base: require('./base')
}
