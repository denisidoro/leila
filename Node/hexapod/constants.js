// Commands
define("MOVE_AX12", 		0xA0);		// 160
define("READ_AX12",			0xA1);		// 161
define("LED_BLINK_TEST",	0x80);		// 128
define("RESPONSE_TEST",		0x81);		// 129

// Dynamixel-defined
define("POSITION", 			36);		// AX_PRESENT_POSITION_L
define("SPEED", 			38);		// AX_PRESENT_SPEED_L
define("LOAD", 				40);		// AX_PRESENT_LOAD_L
define("VOLTAGE", 			42);		// AX_PRESENT_VOLTAGE
define("TEMPERATURE", 		43);		// AX_PRESENT_TEMPERATURE
define("MOVING",			46);		// AX_MOVING

// Dimensions
define("COXA_LENGTH",		49.716);   	// in mm 
define("FEMUR_LENGTH",		82.9);     	// in mm
define("TIBIA_LENGTH",		144.448);  	// in mm
define("L",					[exports.COXA_LENGTH, exports.FEMUR_LENGTH, exports.TIBIA_LENGTH]);

//Angle limits
define("ALPHA_LIMIT",		1.309); 	//in rad (~ 75 degrees)
define("BETA_UPPER_LIMIT",	1.5708); 	//in rad (~ 90 degress)
define("BETA_LOWER_LIMIT",  -0.523599); //in rad (~ -30 degrees)
define("GAMMA_UPPER_LIMIT",	2.0944);    //in rad (~ 120 degrees)
define("GAMMA_LOWER_LIMIT", 0);

// Helper for defining exportable constants
function define(name, value, obj, writable) {
  Object.defineProperty(obj || exports, name, {
      value:      	value,
      enumerable: 	true,
      writable: 	writable
  });
}
