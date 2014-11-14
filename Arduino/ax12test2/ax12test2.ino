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

	for (int i = 0; i < 3; i++)
		Dynamixel.move(i + 1, 800);

}

void loop(){

	if (Serial.available()) {
		/*setPos(Serial.parseInt(), Serial.parseInt(), Serial.parseInt(), angles);
		printAngles(angles);
		for (int i = 0; i < 3; i++)
			Dynamixel.moveSpeed(i + 1, angles[i], 1020);*/
		angles[0] = Serial.parseInt();
		angles[1] = Serial.parseInt();
		angles[2] = Serial.parseInt();
		Dynamixel.moveSpeed(1, angles[0], 1020);
		delay(100);
		Dynamixel.moveSpeed(2, angles[1], 1020);
		delay(100);
		Dynamixel.moveSpeed(3, angles[2], 1020);
		//delay(1);
		printAngles(angles);
	}
 
}

// x, y and z in mm
// angles between 0 and 1023 (0 and 300 degrees)
// "Modelling and control of a six-legged mobile robot", page 43
void setPos(int x, int y, int z, int *angles) {

	float l1_2 = FemurLength*FemurLength, l2_2 = TibiaLength*TibiaLength;
	float x_2 = x*x, z_2 = z*z;

	angles[0] = radianToBit(atan2(z, x));
	angles[1] = radianToBit(acos((l1_2 + x_2 + z_2 - l2_2)/(2*FemurLength*sqrt(x_2 + z_2))) - angles[0]);
	angles[2] = radianToBit(acos((l1_2 + l2_2 - x_2 - z_2)/(2*FemurLength*TibiaLength)));

}

int radianToBit(float radian) {
    int bits = 3069/(5 * M_PI)*(radian + 5*M_PI/6);
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
