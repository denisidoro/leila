#include <Math.h>
#include "constants.h"
#include "DynamixelSerial2.h"

int angles[3];

void setup(){

	Serial.begin(9600); 
	Dynamixel.begin(1000000, AX12Pin);
	delay(1000);

	setPos(3, 4, 5, angles);
	printAngles(angles);

}

void loop(){

	if (Serial.available()) {
		setPos(Serial.parseInt, Serial.parseInt, Serial.parseInt, angles);
		for (int i = 0; i < 3; i++)
			Dynamixel.moveSpeed(i, angles[i], 1020);
	}
 
}

// x, y and z in mm
// angles between 0 and 1023 (0 and 300 degrees)
// "Modelling and control of a six-legged mobile robot", page 43
void setPos(int x, int y, int z, int *angles) {

	float l1_2 = FemurLength*FemurLength, l2_2 = TibiaLength*TibiaLength;
	float x_2 = x*x, z_2 = z*z;

	angles[0] = radianToBits(atan2(z, x));
	angles[1] = radianToBits(acos((l1_2 + x_2 + z_2 - l2_2)/(2*FemurLength*sqrt(x_2 + z_2))) - angles[0]);
	angles[2] = radianToBits(acos((l1_2 + l2_2 - x_2 - z_2)/(2*FemurLength*TibiaLength)));

}

int radianToBits(float radian) {
    int bits = 3069/(5 * M_PI)*radian;
	return (bits < 1024 ? bits : 1023);
}

void printAngles(int angles[3]) {
	Serial.print("(");
	for (int i = 0; i < 3; i++) {
		Serial.print(angles[i]);
		if (i == 2) Serial.print(",");
		else Serial.print(", ");
	}
	Serial.print(")\n");
}