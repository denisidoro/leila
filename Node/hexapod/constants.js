// Dimensions
define("COXA_LENGTH",		52);   		// in mm 
define("FEMUR_LENGTH",		84);     	// in mm
define("TIBIA_LENGTH",		142.6);  	// in mm
define("L",					[exports.COXA_LENGTH, exports.FEMUR_LENGTH, exports.TIBIA_LENGTH]);

// Angle limits
define("ALPHA_LIMIT",		1.309); 	// in rad (~ 75 degrees)
define("BETA_UPPER_LIMIT",	1.5708); 	// in rad (~ 90 degress)
define("BETA_LOWER_LIMIT",  -0.523599); // in rad (~ -30 degrees)
define("GAMMA_UPPER_LIMIT",	2.0944);    // in rad (~ 120 degrees)
define("GAMMA_LOWER_LIMIT", 0);

//Alpha limits in bits
define("ALPHA_UPPER_LIMIT_BITS",	750);
define("ALPHA_LOWER_LIMIT_BITS",    270);

// Helper for defining exportable constants
function define(name, value, obj, writable) {
  Object.defineProperty(obj || exports, name, {
      value:      	value,
      enumerable: 	true,
      writable: 	writable
  });
}
