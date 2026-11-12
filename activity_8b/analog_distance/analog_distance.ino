// Only for the course's ANALOG-output distance sensor; not HC-SR04.
// Conversion follows course slides. Verify against your exact sensor datasheet.
void setup() {
  Serial.begin(9600);
}
void loop() {
  int raw = analogRead(A0);
  float cm = raw * 520.0 / 1023.0;
  Serial.print("Raw: ");
  Serial.print(raw);
  Serial.print(" Distance: ");
  Serial.print(cm, 1);
  Serial.println(" cm");
  delay(100);
}
