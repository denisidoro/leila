
String readString;
#include <VarSpeedServo.h> 
VarSpeedServo servo0, servo1;  // create servo object to control a servo 

void setup() {

	Serial.begin(9600);
	servo0.attach(9, 60, 160);  //the pin for the servoa control
	servo1.attach(11, 60, 160);  //the pin for the servob control

}

void loop() {

	if (Serial.available()) {
		int angle0 = Serial.parseInt();
		int speed0 = Serial.parseInt();
		int angle1 = Serial.parseInt();
		int speed1 = Serial.parseInt();
		servo0.write(angle0, speed0);
		servo1.write(angle1, speed1);
	}

}