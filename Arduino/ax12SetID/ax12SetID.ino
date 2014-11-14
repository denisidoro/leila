#include "DynamixelSerial2.h"

void setup() {

	Serial.begin(9600); 
	Dynamixel.begin(1000000, 2);

	delay(1000);

	for (int id = 0; id < 253; id++) {
		int t = Dynamixel.move(id, 1000);
		Serial.print(id);
		Serial.print(", ");
		Serial.print(t);
		Serial.print("\n");
		delay(1000);
	}

}

void loop() {

}

