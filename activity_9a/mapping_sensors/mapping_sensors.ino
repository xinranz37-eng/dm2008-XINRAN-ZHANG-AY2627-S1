// Course analog-output distance sensor on A0; LED via resistor on PWM pin 9.
const int sensorPin = A0,
  ledPin = 9;
float smoothedCM = 0;
bool firstReading = true;
void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
}
void loop() {
  float cm = analogRead(sensorPin) * 520.0 / 1023.0;
  cm = constrain(cm, 5.0, 100.0);
  if (firstReading) {
    smoothedCM = cm;
    firstReading = false;
  } else {
    smoothedCM += 0.2 * (cm - smoothedCM);
  }
  int brightness = map((long) smoothedCM, 5, 100, 255, 0);
  brightness = constrain(brightness, 0, 255);
  analogWrite(ledPin, brightness);
  Serial.print("Distance cm: ");
  Serial.print(smoothedCM, 1);
  Serial.print(" Brightness: ");
  Serial.println(brightness);
  delay(30);
}
