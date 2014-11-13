
#include "DynamixelSerial2.h"

void setup(){

Serial.begin(9600);              // Begin Serial Comunication
Dynamixel.begin(1000000,2);  // Inicialize the servo at 1Mbps and Pin Control 2
delay(1000);

for (int id = 0; id <= 254; id ++)
	Dynamixel.reset(id);

}

void loop(){

  Serial.print(1);   // Print the variables in the Serial Monitor
  int r = random(200, 800);
  int v = random(250, 1020);
  Dynamixel.moveSpeed(1, r, v);  // Move the Servo radomly from 200 to 800 
  Serial.print(r);
  Serial.print(", ");
  Serial.print(v);
  Serial.print("\n");
  delay(1500);
 
}
