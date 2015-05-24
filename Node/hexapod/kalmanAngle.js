/* ===== constants ===== */

var mpu = new (require("./mpu6050"));
mpu.initialize();

var RAD_TO_DEG = 57.29578;
var M_PI = 3.14159265358979323846;
var DT = 0.001;

//Used by Kalman Filters
var Q_angle = 0.01;
var Q_gyro = 0.0003;
var R_angle = 0.01;
var x_bias = 0;
var y_bias = 0;
var XP_00 = 0, XP_01 = 0, XP_10 = 0, XP_11 = 0;
var YP_00 = 0, YP_01 = 0, YP_10 = 0, YP_11 = 0;
var KFangleX = 0.0;
var KFangleY = 0.0;


/* ===== helpers ===== */

function kalmanFilterX(accAngle, gyroRate) {

    var y, S;
    var K_0, K_1;

    KFangleX += DT * (gyroRate - x_bias);

    XP_00 +=  - DT * (XP_10 + XP_01) + Q_angle * DT;
    XP_01 +=  - DT * XP_11;
    XP_10 +=  - DT * XP_11;
    XP_11 +=  + Q_gyro * DT;

    y = accAngle - KFangleX;
    S = XP_00 + R_angle;
    K_0 = XP_00 / S;
    K_1 = XP_10 / S;

    KFangleX +=  K_0 * y;
    x_bias  +=  K_1 * y;
    XP_00 -= K_0 * XP_00;
    XP_01 -= K_0 * XP_01;
    XP_10 -= K_1 * XP_00;
    XP_11 -= K_1 * XP_01;

    return KFangleX;

}

function kalmanFilterY(accAngle, gyroRate) {

    var y, S;
    var K_0, K_1;

    KFangleY += DT * (gyroRate - y_bias);

    YP_00 +=  - DT * (YP_10 + YP_01) + Q_angle * DT;
    YP_01 +=  - DT * YP_11;
    YP_10 +=  - DT * YP_11;
    YP_11 +=  + Q_gyro * DT;

    y = accAngle - KFangleY;
    S = YP_00 + R_angle;
    K_0 = YP_00 / S;
    K_1 = YP_10 / S;

    KFangleY +=  K_0 * y;
    y_bias  +=  K_1 * y;
    YP_00 -= K_0 * YP_00;
    YP_01 -= K_0 * YP_01;
    YP_10 -= K_1 * YP_00;
    YP_11 -= K_1 * YP_01;

    return KFangleY;

}


/* ===== main ===== */

var KalmanAngle = {

    init: function() {

        var fromIMU = mpu.getMotion6();

        //Convert Gyro raw to degrees per second
        rate_gyr_x = fromIMU[3];
        rate_gyr_y = fromIMU[4];
        rate_gyr_z = fromIMU[5];

        //Convert Accelerometer values to degrees
        AccXangle = (Math.atan(fromIMU[1]/fromIMU[2]))*RAD_TO_DEG;
        AccYangle = (Math.atan(-fromIMU[0]/fromIMU[2]))*RAD_TO_DEG; 

        //Kalman Filter
        var kalmanX = kalmanFilterX(AccXangle, rate_gyr_x);
        var kalmanY = kalmanFilterY(AccYangle, rate_gyr_y);

        // do something?
        console.log(fromIMU);

    }

}

module.exports = KalmanAngle;