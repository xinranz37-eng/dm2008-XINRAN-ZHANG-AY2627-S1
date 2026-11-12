// The always-on LED is connected to 5V through its own resistor.
int blinkPin = 13;
int fadePin = 9;
int brightness = 0;
int fadeAmount = 5;

void setup() {
  pinMode(blinkPin, OUTPUT);
  pinMode(fadePin, OUTPUT);
}

void loop() {
  digitalWrite(blinkPin, HIGH);
  delay(100);
  digitalWrite(blinkPin, LOW);
  delay(100);

  analogWrite(fadePin, brightness);
  brightness = brightness + fadeAmount;

  if (brightness >= 255) {
    brightness = 255;
    fadeAmount = -5;
  }
  if (brightness <= 0) {
    brightness = 0;
    fadeAmount = 5;
  }
  delay(30);
}
