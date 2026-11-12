// Sends ONE numeric distance per line for the existing flower sketch.
// Requires course analog-output sensor, NOT HC-SR04.
void setup() {
  Serial.begin(9600);
}
void loop() {
  float cm = analogRead(A0) * 520.0 / 1023.0;
  Serial.println(constrain(cm, 5.0, 100.0), 1);
  delay(30);
}
