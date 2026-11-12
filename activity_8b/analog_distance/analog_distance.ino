// Activity 8b - Ultrasonic Sensor
// Use the analog-output sensor shown in the course slides.
int sensorPin = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(sensorPin);
  float distanceCM = sensorValue * 520.0 / 1023.0;

  if (distanceCM < 2) {
    distanceCM = 2;
  }
  if (distanceCM > 500) {
    distanceCM = 500;
  }

  Serial.print("Distance: ");
  Serial.print(distanceCM, 1);
  Serial.println(" cm");
  delay(100);
}
