const int ledPin = 9;
int brightness = 0, step = 5;
void setup() {
  pinMode(ledPin, OUTPUT);
}
void loop() {
  analogWrite(ledPin, brightness);
  brightness += step;
  if (brightness >= 255) {
    brightness = 255;
    step = -5;
  }
  if (brightness <= 0) {
    brightness = 0;
    step = 5;
  }
  delay(30);
}
