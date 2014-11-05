#include <VarSpeedServo.h> 

#define SERVO_COUNT 4;

VarSpeedServo sv[12]; 
int svt[12];

void setup() {

	Serial.begin(9600);

	for (int i = 0; i < SERVO_COUNT; i++) {
		sv.attach(2 + i, 900, 2100);
	}

}

void loop() {

	if (Serial.available()) {
		for (int i = 0; i < SERVO_COUNT; i++) {
			svt[i] = Serial.parseInt();
		}
		updateServos();
	}

}

void updateServos() {
	for (int i = 0; i < SERVO_COUNT; i++) {
		sv[i].write(svt[i]);
	}
}
