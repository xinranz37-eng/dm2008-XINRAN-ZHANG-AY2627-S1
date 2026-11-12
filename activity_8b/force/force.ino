// Test the force sensor alone on A0, Serial Monitor at 9600 baud.
const int sensorPin = A0;
void setup() {
  Serial.begin(9600);
}
void loop() {
  Serial.println(analogRead(sensorPin));
  delay(100);
}
