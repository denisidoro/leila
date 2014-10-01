#include <Servo.h>

Servo servo0;
Servo servo1;

void setup() {
	servo0.attach(11, 0 , 180);
	servo1.attach(9, 0 , 180);
	Serial.begin(9600);
}

void loop() {
	if (Serial.available() > 0) {
		int servo = Serial.parseInt();
		int angle = Serial.parseInt();
		Serial.println(servo);
		Serial.println(angle);
		switch (servo) {
			case 1:
				servo0.write(angle);
				break;
			case 2:
				servo1.write(angle);
				break;
		}
	}
}
