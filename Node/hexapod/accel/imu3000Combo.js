var i2c = require('i2c'),
  math  = require("mathjs");

function IMU(){
	this.device = '/dev/i2c-1';
	this.addressGyro = 0x68;		// Gyro I2C address
	this.addressAccel = 0x53;		//Accel I2C address
}


IMU.prototype.initialize = function() {
  this.i2cdev = new I2cDev(this.addressGyro, {device : this.device});			// Gyroscope
  this.i2cdev2 = new I2cDev(this.addressAccel, {device : this.device});		// Accelerometer
  
	//this.setClockSource(IMU.CLOCK_PLL_XGYRO);
	this.setFullScaleGyroRange(IMU.GYRO_FS_250);		// Gyro Full-Scale Range = 250 deg/s
	this.setDLPFGyroBandwidth(IMU.GYRO_DLPF_CFG_42_1);	// Gyro Low Pass Filter Bandwidth = 42Hz , Analog Sample Rate = 1kHz
	this.setAccelRegDataAddress();						// Save the accelerometer register data address on a gyroscope register
	this.setAccelI2CSlaveAddress();						// Set the accelerometer as a slave device of the gyroscope
	this.setPassthroughModeAccel();						// Set passthrough mode to accelerometer so we can turn it on
	this.setAccelMeasure();								    // Set the accelerometer power control to 'measure'
	this.setFullScaleAccelRange(IMU.ACCEL_FS_2);		// Accelerometer range = 2g
	this.cancelPassthroughModeAccel();					// Cancel passthrough mode to accelerometer, gyro will now read accel
				
	this.setSleepEnabled(false);
};


//_____________________________________________________________________________________________________________________________________________________________
// GYRO SETTINGS
IMU.RA_GYRO_CONFIG = 0x16;

//Gyro Full-Scale Range parameters
IMU.GCONFIG_FS_SEL_BIT = 4;
IMU.GCONFIG_FS_SEL_LENGTH = 2;
IMU.GYRO_FS_250  = 0x00;	//Gyro Full-Scale Range = +-250°/sec
IMU.GYRO_FS_500  = 0x01;
IMU.GYRO_FS_1000 = 0x02;
IMU.GYRO_FS_2000 = 0x03;

//DLPF_CFG parameters (DLPF: Digital Low Pass Filter)
IMU.GCONFIG_DLPF_CFG_BIT = 2;
IMU.GCONFIG_DLPF_CFG_LENGTH = 2;
IMU.GYRO_DLPF_CFG_256_8 = 0X00; 	//Low Pass Filter Bandwidth = 256Hz, Analog Sample Rate = 8kHz
IMU.GYRO_DLPF_CFG_188_1 = 0X01;
IMU.GYRO_DLPF_CFG_98_1 = 0X02;
IMU.GYRO_DLPF_CFG_42_1 = 0X03;
IMU.GYRO_DLPF_CFG_20_1 = 0X04;
IMU.GYRO_DLPF_CFG_10_1 = 0X05;
IMU.GYRO_DLPF_CFG_5_1 = 0X06;


// return current full-scale gyroscope settings
IMU.prototype.getFullScaleGyroRange = function() {
  return this.i2cdev.readBits(IMU.RA_GYRO_CONFIG, IMU.GCONFIG_FS_SEL_BIT, IMU.GCONFIG_FS_SEL_LENGTH);
};

// set a new full-scale gyroscope range
IMU.prototype.setFullScaleGyroRange = function(range) {
  this.i2cdev.writeBits(IMU.RA_GYRO_CONFIG, IMU.GCONFIG_FS_SEL_BIT, IMU.GCONFIG_FS_SEL_LENGTH, range);
};



// return current bandwidth of the digital low pass filter on the gyro
IMU.prototype.getDLPFGyroBandwidth = function() {
  return this.i2cdev.readBits(IMU.RA_GYRO_CONFIG, IMU.GCONFIG_DLPF_CFG_BIT , IMU.GCONFIG_DLPF_CFG_LENGTH);
};

// set a new bandwidth for the digital low pass filter on the gyro
IMU.prototype.setDLPFGyroBandwidth = function(bandwidth) {
	this.i2cdev.writeBits(IMU.RA_GYRO_CONFIG, IMU.GCONFIG_DLPF_CFG_BIT , IMU.GCONFIG_DLPF_CFG_LENGTH, bandwidth);
};



IMU.RA_GYRO_I2C_2 = 0x18;
IMU.I2C_2_BIT = 7;
IMU.I2C_2_LENGTH = 7;
IMU.ACCEL_DATA_REGISTER = 0x32;

// Add the accel data register on a gyro register
IMU.prototype.setAccelRegDataAddress = function() {
	this.i2cdev.writeBits(IMU.RA_GYRO_I2C_2, IMU.I2C_2_BIT , IMU.I2C_2_LENGTH, IMU.ACCEL_DATA_REGISTER);
};


IMU.RA_GYRO_SLAVE_ADDRESS = 0X14;
IMU.SLAVE_ADDRESS_BIT = 6;
IMU.SLAVE_ADDRESS_LENGTH = 6;
IMU.ACCEL_I2C_ADDRESS = 0x53;

// Set the accelerometer as a slave device of the gyro
IMU.prototype.setAccelI2CSlaveAddress = function() {
	this.i2cdev.writeBits(IMU.RA_GYRO_SLAVE_ADDRESS, IMU.SLAVE_ADDRESS_BIT , IMU.SLAVE_ADDRESS_LENGTH, IMU.ACCEL_I2C_ADDRESS);
};


IMU.RA_GYRO_USER_CONTROL = 0x3D;
IMU.AUX_IF_RST_BIT = 3;
IMU.AUX_IF_RST_LENGTH = 1;
IMU.AUX_IF_EN_BIT = 5;
IMU.AUX_IF_EN_LENGTH = 1;
IMU.SET_1 = 1;
IMU.SET_0 = 0;

// Enable the access to the secondary I2C between the gyro and accel
IMU.prototype.setPassthroughModeAccel = function() {
	this.i2cdev.writeBits(IMU.RA_GYRO_USER_CONTROL, IMU.AUX_IF_RST_BIT , IMU.AUX_IF_RST_LENGTH, IMU.SET_1);
  this.i2cdev.writeBits(IMU.RA_GYRO_USER_CONTROL, IMU.AUX_IF_EN_BIT , IMU.AUX_IF_EN_LENGTH, IMU.SET_0);
};


// Disable the secondary I2C
IMU.prototype.cancelPassthroughModeAccel = function() {
	this.i2cdev.writeBits(IMU.RA_GYRO_USER_CONTROL, IMU.AUX_IF_EN_BIT , IMU.AUX_IF_EN_LENGTH, IMU.SET_1);
};


//_____________________________________________________________________________________________________________________________________________________________
// ACCELEROMETER SETTINGS
IMU.RA_ACCEL_CONFIG = 0x31;
IMU.ACONFIG_AFS_SEL_BIT = 1;
IMU.ACONFIG_AFS_SEL_LENGTH = 2;
IMU.ACCEL_FS_2  = 0x00;			// Range = +-2g
IMU.ACCEL_FS_4  = 0x01;
IMU.ACCEL_FS_8  = 0x02;
IMU.ACCEL_FS_16 = 0x03;

// Manage accel full-scale range
IMU.prototype.getFullScaleAccelRange = function() {
  return this.i2cdev2.readBits(IMU.RA_ACCEL_CONFIG, IMU.ACONFIG_AFS_SEL_BIT, IMU.ACONFIG_AFS_SEL_LENGTH);
};

IMU.prototype.setFullScaleAccelRange = function(range) {
  this.i2cdev2.writeBits(IMU.RA_ACCEL_CONFIG, IMU.ACONFIG_AFS_SEL_BIT, IMU.ACONFIG_AFS_SEL_LENGTH, range);
};


IMU.RA_ACCEL_POWER_CTRL = 0x2D;
IMU.APOWER_CTRL_BIT = 3;
MU.APOWER_CTRL_LENGTH = 1

//Active the accelerometer
IMU.prototype.setAccelMeasure = function() {
	this.i2cdev2.writeBits(IMU.RA_ACCEL_POWER_CTRL, IMU.APOWER_CTRL_BIT, IMU.APOWER_CTRL_LENGTH, IMU.SET_1);
};



//_____________________________________________________________________________________________________________________________________________________________
// sensor registers
IMU.RA_GYRO_XOUT_H = 0x1D;
IMU.RA_ACCEL_XOUT_H = 0x23;


// return the raw values measured by the gyroscope
// the data read by the gyro are stored in the Big-Endian (the most significant byte is stored in the smallest address)
IMU.prototype.getRotationRaw = function() {
  var buffer = this.i2cdev.readBytes(IMU.RA_GYRO_XOUT_H, 6);
  return [
   	buffer.readInt16BE(0),
   	buffer.readInt16BE(2), 
   	buffer.readInt16BE(4)
  ];  
};


// return the raw values measured by the accelerometer
// the data read by the accelerometer are stored in the Little-Endian (the least significant byte is stored in the smallest address)
IMU.prototype.getAccelerationRaw = function() {
 	buffer = this.i2cdev.readBytes(IMU.RA_ACCEL_XOUT_H, 6);
  return [
    buffer.readInt16LE(0),
    buffer.readInt16LE(2),
    buffer.readInt16LE(4)
  ];
};


// return the raw values measured by the gyroscope + accelerometer
IMU.prototype.getMotionRaw = function() {
  buffer = this.i2cdev.readBytes(IMU.RA_GYRO_XOUT_H, 12);
  return [
    buffer.readInt16BE(0),
    buffer.readInt16BE(2),
    buffer.readInt16BE(4),
    buffer.readInt16LE(6),
    buffer.readInt16LE(8),
    buffer.readInt16LE(10)
  ];
};


// Manage the clock source
IMU.RA_PWR_MGMT_1 = 0x3E;
IMU.PWR1_CLKSEL_BIT = 2;
IMU.PWR1_CLKSEL_LENGTH = 3;

// Clock source
// 0: Internal oscillator
// 1: PLL with X Gyro reference
// 2: PLL with Y Gyro reference
// 3: PLL with Z Gyro reference
// 4: PLL with external 32.768kHz reference
// 5: PLL with external 19.2MHz reference
// 6: Reserved
// 7: Stops the clock and keeps the timing generator in reset


IMU.prototype.getClockSource = function() {
  return this.i2cdev.readBits(IMU.RA_PWR_MGMT_1, IMU.PWR1_CLKSEL_BIT, IMU.PWR1_CLKSEL_LENGTH);
};

IMU.prototype.setClockSource = function(source) {
  this.i2cdev.writeBits(IMU.RA_PWR_MGMT_1, IMU.PWR1_CLKSEL_BIT, IMU.PWR1_CLKSEL_LENGTH, source);
};





IMU.prototype.Calibrate = function() {
  var n =100;
  var offset = math.zeros(6);
  var offsetAux = math.zeros(6);

  for (var i = 0; i < n ; i++) {
    offsetAux = math.add(offsetAux, this.getMotionRaw());
    //delay
  };
  offset = math.multiply(offsetAux, 1/n);
  return offset;
};


IMU.RA_GYRO_OFFSETX = 0X0C;
IMU.RA_ACC_OFFSETX = 0X1E;

IMU.prototype.getOffset = function(){
  bufferGyro = this.i2cdev.readBytes(IMU.RA_GYRO_OFFSETX, 6);

  this.setPassthroughModeAccel();
  bufferAcc = this.i2cdev2.readBytes(IMU.RA_ACC_OFFSETX, 3);
  this.cancelPassthroughModeAccel();

  return [
    bufferGyro.readInt16BE(0),
    bufferGyro.readInt16BE(2),
    bufferGyro.readInt16BE(4),
    bufferAcc.readInt16LE(0),
    bufferAcc.readInt16LE(1),
    bufferAcc.readInt16LE(2)
  ];

};

//the values of gyro offset are subtracted from the sensor values, so they must be positives
//the values of accelerometer osffset are added to the sensor values, so they must be negatives
IMU.prototype.setOffSet = function(offset) {
  var gyroOffset = math.zeros(3);
  var accOffset = math.zeros(3);
  for (var i = 0; i<3 ; i++) {
    this.dev.writeBytes(IMU.RA_GYRO_OFFSETX, gyroOffset,callback);

  this.setPassthroughModeAccel();
  this.i2cdev2.writeBytes(IMU.RA_ACC_OFFSETX, accOffset, callback);
  this.cancelPassthroughModeAccel();

};






module.exports = IMU;

//_____________________________________________________________________________________________________________________________________________________________
/**
 * This class extends the i2c library with some extra functionality available
 * in the i2cdev library that the MPU60X0 library uses.
 */
function I2cDev(address, options) {
  	i2c.call(this, address, options);
}

I2cDev.prototype = Object.create(i2c.prototype);
I2cDev.prototype.constructor = I2cDev;

I2cDev.prototype.bitMask = function(bit, bitLength) {
  	return ((1 << bitLength) - 1) << (1 + bit - bitLength);
};

I2cDev.prototype.readBits = function(func, bit, bitLength, callback) {
  var mask = this.bitMask(bit, bitLength);
  
  if (callback) {
    this.readBytes(func, 1, function(err, buf) {
      var bits = (buf[0] & mask) >> (1 + bit - bitLength);
      	callback(err, bits);
    	});
  	} else {
    	var buf = this.readBytes(func, 1);
   		return (buf[0] & mask) >> (1 + bit - bitLength);
  }
};

I2cDev.prototype.readBit = function(func, bit, bitLength, callback) {
  	return this.readBits(func, bit, 1, callback);
};

I2cDev.prototype.writeBits = function(func, bit, bitLength, value, callback) {
  var oldValue = this.readBytes(func, 1);
  var mask = this.bitMask(bit, bitLength);
  var newValue = oldValue ^ ((oldValue ^ (value << bit)) & mask);
  this.writeBytes(func, [newValue], callback);
};

I2cDev.prototype.writeBit = function(func, bit, value, callback) {
  this.writeBits(func, bit, 1, value, callback);
};
